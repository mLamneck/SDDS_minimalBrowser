import { TobservedItem, Tpath, TstructDescr } from "./sdds/types";
import { TjsTimeout } from "./types"
import Sockette from 'sockette';

type TremoteServerStatus = "created"|"connected"|"reconnecting"|"closed"

type TconnectionTask = "close"|"open"|"linked"

class Tconnection{
    private Fstruct : TstructDescr|null
    private Fpath : Tpath
    private Fport : number
    private Ftask : TconnectionTask
    
    get task() { return this.Ftask }
    get pathStr(){ return this.Fpath.join('.') }

    flagForClose() { this.Ftask = "close" }

    get canBeRecycled() { return this.Ftask = "close" }
    
    reactivate(_data : TobservedItem){
        this.Fstruct = _data.struct;
        this.Fpath = _data.path.slice()
        this.Ftask = "open"
    }

    onWsReconnect(){
        if (this.Ftask === "linked") this.Ftask = "open"
    }

    dataReceived(){
        switch(this.Ftask){
            case "open" : 
                this.Ftask = "linked"
                break;
            
            //do nothing, connectionThread will handle this
            case "close": break 
        }
    }

    get struct() { return this.Fstruct }
    get port() { return this.Fport }

    constructor(_data: TobservedItem, _port : number){
        this.Fport = _port
        this.Fpath = _data.path.slice()
        this.Fstruct = _data.struct
        this.Ftask = "open"
    }
}

type TrrContext = {
    nextIdx : number
}
const TrrContextInitial : TrrContext = {
    nextIdx : 0
}

class TconnectionList{
    static FIRST_PORT = 1

    private Flist : (Tconnection|null)[] = [];
    
    findForRecycling() : Tconnection|null{
        let res = null
        this.iterate(c=>{
            if (c.canBeRecycled){
                res = c
                return false
            }
        })
        return res
    }

    allocate(_data : TobservedItem){
        //first try to find a connection for recycling
        let newConn = this.findForRecycling()
        if (newConn){
            newConn.reactivate(_data)
            return newConn
        }

        //if no for recycling found, try to find an empty slot and insert a new onw
        this.Flist.forEach((conn,idx)=>{
            if (!conn){
                const c = new Tconnection(_data,idx+TconnectionList.FIRST_PORT)
                this.Flist[idx] = c
                newConn = c
                return false
            }
        })
        if (newConn) return newConn

        //if nothing found, append a new connection to the list
        newConn = new Tconnection(_data,this.Flist.length + TconnectionList.FIRST_PORT)
        this.Flist.push(newConn)
        return newConn
    }

    findByPort(_port : number){
        const idx = _port - TconnectionList.FIRST_PORT
        if (idx < 0 || idx >= this.Flist.length) return null
        return this.Flist[idx]
    }

    findByStruct(_struct : TstructDescr): Tconnection|null{
        let res = null
        this.iterate(c=>{
            if (_struct === c.struct){
                res = c
                return false
            }
        })
        return res
    }

    _iterate(conns : (Tconnection|null)[], _cb : (conn : Tconnection) => void|boolean){
        let visitedIdx = -1
        conns.forEach((c,idx)=>{
            visitedIdx = idx
            if (c) return _cb(c)    //break if callback returns false
        })
        return visitedIdx
    }

    iterate(_cb : (conn : Tconnection) => void|boolean){
        return this._iterate(this.Flist,_cb)
    }

    iterateRR(_cb : (conn : Tconnection) => void|boolean, _rr : TrrContext){
        let start = _rr.nextIdx
        if (start < 0 || start >= this.Flist.length) start = 0 
        const conns = [...this.Flist.slice(start),...this.Flist.slice(0,start)]
        const lastVisited = this._iterate(conns,_cb)
        _rr.nextIdx=lastVisited+1
    }

    setToClosed(port : number){
        const conn = this.findByPort(port)
        if (!conn) return
        if (conn.task !== "close") return
        this.Flist[this.Flist.indexOf(conn)] = null
    }

    log(){
        console.log("-> log Connections XXXXXXXXXXXXXXXXXXXXXX")
        this.iterate(c => console.log(c))
        console.log("<- log Connections XXXXXXXXXXXXXXXXXXXXXX")
    }
}

class TremoteServer extends TstructDescr{
    private Fhost : string
    private Fsocket : Sockette|undefined
    private Fstatus : TremoteServerStatus = "created"
    private FdataStruct : TstructDescr

    private Fconns : TconnectionList
    private FconnTimer : TjsTimeout|null = null
    private FconnRR : TrrContext = TrrContextInitial

    private FcheckActivateTimer : TjsTimeout|null = null
    private FupdatesDisabled : boolean = false
    
    get dataStruct() { return this.FdataStruct }
    get status() { return this.Fstatus }
    set status(_val) { 
        this.Fstatus = _val
        this.emitOnChange()
    }

    constructor(_host : string){
        super(`${_host}`)
        this.FdataStruct = new TstructDescr("data")
        this.push(this.FdataStruct)
        this.Fhost = _host
        this.Fconns = new TconnectionList()
        this.connect()
        //const menuDefStr = '[{"type":1,"opt":0,"name":"cntSwitch","value":"on","enums":["on","off"]},{"type":1,"opt":0,"name":"Fcnt","value":5},{"type":66,"opt":0,"name":"sub","value":[{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value21","value":7.50},{"type":4,"opt":0,"name":"time1","value":1000},{"type":1,"opt":0,"name":"led","value":"off","enums":["on","off"]}]},{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value","value":0.00},{"type":36,"opt":0,"name":"fValue","value":0.00}]'
        //this.handleTypeMessage(menuDefStr)
    }

    connectionThread(){
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> ConnectionThread <<<<<<<<<<<<<<<<<<<<<<<<<<<<< ")
        this.FconnTimer = null

        this.Fconns.log()

        //first check for connections to be closed -> reduce the traffic with the server
        this.Fconns.iterateRR(c=>{
            if (c.task === "close"){
                this.send(`U ${c.port}`)
                return this.triggerConnectionThread(1000)
            }
        },this.FconnRR)

        this.Fconns.iterateRR(c=>{
            if (c.task === "open"){
                this.send(`L ${c.port} ${c.pathStr}`)
                return this.triggerConnectionThread(1000)
            }
        },this.FconnRR)
    }
    
    triggerConnectionThread(_timeout : number = 0) { 
        if (this.FconnTimer) clearTimeout(this.FconnTimer)
        this.FconnTimer = setTimeout(()=>{ this.connectionThread() },_timeout) 
    }
    
    get connectionThreadRunning() { return this.FconnTimer !== null }
    
    inObserved(observed : TobservedItem[], conn: Tconnection){
        let oIdx = -1
        observed.forEach((o,idx)=>{
            if (o.struct === conn.struct){
                oIdx = idx
                return false
            }
        })
        return oIdx >= 0
    }

    _checkActivate(){
        console.log("_checkActivate")
        this.FcheckActivateTimer = null

        //retireve a list of all structures beeing observed
        const observed : TobservedItem[] = []
        this.FdataStruct.collectObserved(observed,[])
        console.log(observed)

        //find all active connections for items no longer observed and flag to be closed
        this.Fconns.iterate(conn=>{
            if (!this.inObserved(observed,conn)) conn.flagForClose()
        })

        //for all items that are observed initiate a connection if not already there
        observed.forEach(o=>{
            const conn = this.Fconns.findByStruct(o.struct) 
            if (!conn) this.Fconns.allocate(o)
            else if (conn.canBeRecycled) conn.reactivate(o)
        })

        //finally start connection thread to do the work
        if (!this.connectionThreadRunning) this.triggerConnectionThread()

    }

    checkActivation(){
        console.log("checkActivation")
        if (this.FcheckActivateTimer) clearTimeout(this.FcheckActivateTimer)
        console.log("trigger checkActivation")
        this.FcheckActivateTimer = setTimeout(()=>{this._checkActivate()},100)
    }
    
    installUpdateObservers(){
        this.FdataStruct.iterate((element,path)=>{
            if (!element.isStruct){
                element.observers.add(item=>{
                    if (!this.FupdatesDisabled) 
                        this.send(path.join('.') + '=' + item.value)    //toDo: debounce?
                })
            }
        })
    }

    static LINK_MSG_PATTERN = /^\s*(\d+)\s+(\d+)\s+(.+)/
    handleLinkMessage(data : string){
        //console.log(`handleLinkMessage "${data}" last=${data.slice(-1)}`)

        //remove seperator at the end (this is a bug in my ssds lib in C++)
        if (data.slice(-1) === ",") data=data.slice(0,-1)

        //split into port, firstItem, rest
        const match = data.match(TremoteServer.LINK_MSG_PATTERN)
        if (!match) return

        const port = parseInt(match[1])
        const first = parseInt(match[2])
        const values = match[3].split(",")

        console.log("handleLinkData data=",values)

       // this.send("U " + port)
        const conn = this.Fconns.findByPort(port)
        if (!conn) return

        conn.dataReceived()             //stop requesting
        this.FupdatesDisabled = true
        try{
            conn.struct?.readValueArray(values,first)
        }
        finally {
            this.FupdatesDisabled = false
        }
    }

    static UNLINK_MSG_PATTERN = /^\s*(\d+)/
    handleUnlinkMessage(data : string){
        const match = data.match(TremoteServer.UNLINK_MSG_PATTERN)
        if (!match) return

        this.Fconns.setToClosed(parseInt(match[1]))
    }

    static ERR_MSG_PATTERN = /^\s*(\d+)\s+(\d+)(.*)/
    handleErrorMessage(data : string){
        console.log(`handleErrorMessage data = "${data}"`)
        const match = data.match(TremoteServer.ERR_MSG_PATTERN)
        if (!match) return

        //const port = parseInt(match[1])
        const errCode = parseInt(match[2])
        //const errDescr = match[3]
        //const conn = this.Fconns.findByPort(port)
        switch(errCode){
            //couldn't parse port -> nothing we can do about it
            case 1: return
            
            //invalid path
            case 2: return
            
            //path resolved but doesn't point to a struct
            case 3: return

            //path resolved but pointer=nil
            case 4: return

            //invalid port
            case 5: return //this.Fconns.setToClosed(port)

            //INVALID CMD
            case 6: return

            case 100: return this.close()       //connection has been rejected... stop trying
        }
    }

    handleTypeMessage(data : string){
        //toDo! check if struct already exists, compare
        if (this.FdataStruct.childs.length === 0){
            this.FdataStruct.parseJsonStr(data)
            this.installUpdateObservers()
            this.emitOnChange()
        }
    }

    onMessage(_ev : MessageEvent){
        const data = _ev.data
        //console.log('TremoteServer.onMessage!', data)

        //split into cmd and payload
        const idx = data.indexOf(" ")
        if (idx < 0) return
        const cmd = data.substring(0,idx)
        const payload = data.substring(idx+1)

        switch(cmd){
            case "l": return this.handleLinkMessage(payload)
            case "u": return this.handleUnlinkMessage(payload)
            case "E": return this.handleErrorMessage(payload)
            case "t": return this.handleTypeMessage(payload)
        }
    }

    onOpen(){
        console.log("connected")
        this.status = "connected"
        this.requestTypes()
        this.Fconns.iterate(c=>{
            c.onWsReconnect()
        })
        this.triggerConnectionThread(100)
    }

    onClose(){
        console.log("closed")
        this.status = "closed"
    }

    onReconnecting(){
        console.log("reconnect")
        this.status = "reconnecting"
    }

    send(_msg : string){
        if (this.status !== "connected") return
        if (this.Fsocket){
                console.log(`sending "${_msg}"`)
                this.Fsocket.send(_msg)
                if (_msg === "T"){
                }
        }

    }

    requestTypes(){
        this.send("T")
    }

    getWsAdrr() {return `ws://${this.Fhost}/ws`}

    connect(){
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Try to connect to WebSocket")
        if (this.Fsocket !== undefined) this.Fsocket.close()

        //const addr = `ws://192.168.178.68/ws`
        //const addr = `ws://192.168.4.1/ws`
        const addr = this.getWsAdrr()
        console.log("open websocket ... ",addr)

        const ws = new Sockette(addr, {
            timeout: 5e3,
            //maxAttempts: 100,
            onopen: () => this.onOpen(),
            onmessage: e => this.onMessage(e),
            onreconnect: () => {this.onReconnecting()},
            onmaximum: e => console.log('Stop Attempting!', e),
            onclose: () => this.onClose(),
            onerror: e => console.log('Error1:', e)
        });
        this.Fsocket = ws
    }

    close(){
        this.Fsocket?.close()
    }

    cleanup(){
        this.close()
    }
}

export default TremoteServer