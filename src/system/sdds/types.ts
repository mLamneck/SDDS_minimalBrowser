//import { signal } from "@preact/signals";

export type OnChangeCallback = (sender : Tdescr) => void
type Tobserver = {
    tag : number
    cb : OnChangeCallback
}

export type BaseDataTypes = "int"|"uint"|"float"|"enum"|"struct"|"invalid"

// interface Testament{
//     id: number,
//     name : string
//   }

// const reg = new FinalizationRegistry((testament : Testament) => {
//     console.log(`Object ${testament.name} id=${testament.id} has been garbage collected`);
//     console.log(testament)
// });

export type TobserverCb = () => void;

export class TobserverObj{
    Fcb : TobserverCb; 
    Factive : boolean = true;

    get cb() { return this.Fcb; }

    setActive(_val : boolean) { this.Factive = _val}
    notify(){
        if (this.Factive) this.Fcb()
        else console.log("not active")
    }

    constructor(_cb : TobserverCb){
        this.Fcb = _cb;
    }
}

class TObserverList{
    private Fobservers : TobserverObj[] = []
    
    findByCb(_cb : TobserverCb){
        let idx;
        this.Fobservers.forEach((o,_idx)=>{
            if (o.cb == _cb){
                idx = _idx;
                return false;
            } 
        })
        return idx;
    }

    add(_cb : TobserverCb) {
        if (this.findByCb(_cb)) return;
        const observer = new TobserverObj(_cb)
        this.Fobservers.push(observer)
        return observer
    }

    remove(_observer : TobserverObj|undefined){
        if (!_observer) return
        const idx = this.Fobservers.indexOf(_observer)
        if (idx >= 0) this.Fobservers.splice(idx,1)
    }

    notify(){ 
        this.Fobservers.forEach(o=>o.notify()) 
    }

}

export class Tdescr{
    static PATH_SEP = "."

    static objCnt = 0

    static type_uint        = 0x00
    static type_int         = 0x10
    static type_float       = 0x20
    static type_composed    = 0x40
    
    //unsigned integers
    static type_uint8       = Tdescr.type_uint | 0x01
    static type_uint16      = Tdescr.type_uint | 0x02
    static type_uint32      = Tdescr.type_uint | 0x04
    static type_uint64      = Tdescr.type_uint | 0x08

    //signed integers
    static type_int8        = Tdescr.type_int | 0x01
    static type_int16       = Tdescr.type_int | 0x02
    static type_int32       = Tdescr.type_int | 0x04
    static type_int64       = Tdescr.type_int | 0x08

    //floating point types
    static type_float32     = Tdescr.type_float | 0x04
    static type_float64     = Tdescr.type_float | 0x08
    
    //composed types
    static type_struct      = Tdescr.type_composed | 0x02

    //option definition
    static opt = {
        masks : {
            show : 0x0E
        },
        flags : {
            readonly    : 0x01,
            further     : 0x20,
            important   : 0x40,
            saveval     : 0x80
        },
        showMode : {
            hex : 0x04,
            bin : 0x06,
            string : 0x08,
            timeabs : 0x00,
            timerel : 0x02,
        }
    }

    //keys in jeson description
    static json_typeKey     = "type"
    static json_optKey      = "opt"
    static json_valKey      = "value"
    static json_nameKey     = "name"
    static json_enumKey     = "enums"

    id : number
    private Ftype : number = 0
    private Fname : string
    private Foption : number = 0
    protected Fvalue : number|string|Tdescr[] = 0;
    //protected FsigVal

    //get sigVal() {return this.FsigVal}

    protected Fparent : TstructDescr|null = null
    private Fidx : number = -1
    private Fobservers: Tobserver[] = []
    private FobserverList = new TObserverList;
    get observers() { return this.FobserverList }

    get parent() : (TstructDescr|null) { return this.Fparent }
    set parent(_parent : TstructDescr|null) { this.Fparent = _parent }
    set idx(idx : number) { this.Fidx = idx}
    get idx() { return this.Fidx }
    get typeId() { return this.Ftype}
    get type() { return (this.Ftype & 0xF0) }
    get baseType() : BaseDataTypes{
        if (this instanceof TenumDescr) return "enum"
        switch(this.type){
            case Tdescr.type_int: return "int"
            case Tdescr.type_uint: return "uint"
            case Tdescr.type_float: return "float"
            case Tdescr.type_composed: return "struct"
            default : return "invalid"
        }
    }
    get name() { return this.Fname}
    get value() : any {return this.getValue()}
    set value(_val : any) { this.setValue(_val) }
    get readonly() { return (this.Foption&Tdescr.opt.flags.readonly) > 0}

    get editable(){
        return (!this.readonly)
    }

    get isStruct(){
        return (this.Ftype === Tdescr.type_struct)
    }

    get hasChilds(){ return false }

    get isEnum() : boolean{
        return (this instanceof TenumDescr)
    }

    _path(_path : string[]) {
        if (!this.parent) return

        this.parent._path(_path)
        _path.push(this.name)
    }
    
    get path(){
        const path : string[] = []
        this._path(path)
        return path
    }

    get pathStr(){
        return this.path.join(Tdescr.PATH_SEP)
    }

    //there's no such thing as a destructor in javascipt, so we call it cleanup to not get confused later on
    cleanup(){ console.log("Tdescr.cleanup")}

    setValue(_value : any, signalEvent = true){
        //console.log("Tdescr.setValue", _value)
        this.Fvalue = _value
        //this.FsigVal = _value
        if (signalEvent) this.emitOnChange()
    }

    getValue(){
        return this.Fvalue
    }

    toString(){ return this.Fvalue.toString() }

    findObserver(_cb : OnChangeCallback){
        return this.Fobservers.findIndex(o=>o.cb===_cb)
    }

    // registerObserver(_o : TobservedItem){
    //     return _o
    // }

    registerOnChangeCallback(_cb : OnChangeCallback){
        const idx = this.findObserver(_cb)
        if (idx > -1) return
        this.Fobservers.push({cb:_cb, tag:0})
        //console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX registerOnChangeCallback XXXXXXXXXXXXXXX ",this.onChangeCbs)
        this.parent?.checkActivation()
    }

    unregisterOnChangeCallback(_cb : OnChangeCallback){
        const idx = this.findObserver(_cb)
        if (idx > -1) this.Fobservers.splice(idx,1)
        else console.log("unregister failed")
        this.parent?.checkActivation()
    }

    get isObserved(){ 
        return this.Fobservers.length > 1 
    }

    emitOnChange(){
        this.Fobservers.forEach(o=>o.cb(this))
        this.FobserverList.notify()
    }

    readJson(_descr : any){
        if (!_descr.hasOwnProperty(Tdescr.json_typeKey)) throw new Error(`missing ${Tdescr.json_typeKey} in `)
        if (!_descr.hasOwnProperty(Tdescr.json_nameKey)) throw new Error(`missing ${Tdescr.json_nameKey} in `)
        if (!_descr.hasOwnProperty(Tdescr.json_optKey))  throw new Error(`missing ${Tdescr.json_optKey} in `)
        if (!_descr.hasOwnProperty(Tdescr.json_valKey))  throw new Error(`missing ${Tdescr.json_valKey} in `)
        this.Ftype = _descr.type;
        this.Fname = _descr.name;
        this.Foption = _descr.opt;
        this.setValue(_descr.value)
    }

    constructor(_name : string = ""){
        this.Ftype = Tdescr.type_struct
        //this.FsigVal = signal(0);
        this.Fname = _name
        this.id = Tdescr.objCnt++
    }

}

export class TnumberDescr extends Tdescr{
    setValue(_value : any, signalEvent : boolean){
        const temp = parseFloat(_value)
        //console.log(`TnumberDescr.setValue = ${_value} float = ${temp} signalEvent=${signalEvent}`)
        if (!isNaN(temp)) super.setValue(temp,signalEvent)
    }

    getValue() { 
        return this.Fvalue 
    }
}

export class TenumDescr extends Tdescr{
    private Fenums: string[]

    get enums() { return this.Fenums }

    setValue(_value: any, signalEvent: boolean): void {
        if (!this.Fenums) this.Fenums = []
        let value = -1
        switch(typeof _value){
            case "string":
                value = this.Fenums.indexOf(_value)         //try find it in enums
                if (value < 0) value = parseInt(_value)     //parse to int and check if valid later
                break
            case "number":
                value = _value
                //console.log("number",value)
                break
        }
        //console.log(this.Fenums)
        if ((value >= 0) && (value < this.Fenums.length)) super.setValue(value,signalEvent)
    }

    toString(){ return this.enums[this.Fvalue as number] }

    constructor(_descr : any){
        super()
        this.Fenums = []
        const enums = _descr[Tdescr.json_enumKey]
        enums.forEach((e : string)=>this.Fenums.push(e))
        if (!this.Fvalue) this.Fvalue = 0
    }
}

export type Tpath = string[]
type TiterateCallback = (item:Tdescr, _path:Tpath)=>void


export type TobservedItem = {
    path    : Tpath
    struct  : TstructDescr
    first   : Tdescr|null
    last    : Tdescr|null
}

export class TstructDescr extends Tdescr{
    Fvalue : Tdescr[] = []
    
    get editable() { return false }

    get childs(){
        return this.Fvalue;
    }

    get isEmpty(){ return this.childs.length === 0 }
    get hasChilds(){ return !this.isEmpty }
   
    getValue() { return this.isEmpty?"NULL":">" }

    setValue(value : any){
        //nobody is allowed to write to Fvalue
    }

    parseJson(json : any){
        for (const val of json){
            const nextChild = createDescr(val)
            nextChild.readJson(val)
            this.push(nextChild)
            if (nextChild instanceof TstructDescr){
                nextChild.parseJson(val.value)
            }
        }
    }

    parseJsonStr(json : string){
        try{
            const j = JSON.parse(json)
            this.parseJson(j)
        }
        catch(err){
            console.log("parsing json failed: " + err)
        }
    }

    scanTree(
        path : Tpath|string, 
        options? : {
            allowEmptryStructs? : boolean,
        }
    ):TstructDescr|null{
        console.log("scanTree >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        let curr : TstructDescr = this
        console.log(path)
        if (typeof path === "string") path = path.split(/\.|\//)    //split . or /
        const allowEmptryStructs = options?.allowEmptryStructs
        console.log(allowEmptryStructs)

        let found = true
        path.every(entry => {
            found = false
            console.log(`try to find ${entry}`)
            curr.childs.every(menuItem => {
                if (menuItem.name === entry && menuItem.typeId===Tdescr.type_struct){
                    curr = menuItem as TstructDescr
                    console.log(`found item ${curr.name}`)
                    found = true
                    return false
                }
                return true;
            })
            return found
        })
        console.log("scantree 0")
        if (!found) return null
        console.log("scantree 1")
        if (!allowEmptryStructs && curr.childs.length<1) return null
        console.log("scantree 2")
        return curr
    }

    log(){
        this.Fvalue.forEach(descr=>{
            console.log(descr)
            console.log(descr.name, " = ", descr.value)
        })
    }

    _iterate(_cb : TiterateCallback, _path : Tpath){
        this.childs.forEach(element => {
            const path = [..._path,element.name]
            _cb(element,path)
            if (element.baseType === "struct"){
                (element as TstructDescr)._iterate(_cb,path)
            }
        });

    }
    iterate(_cb : TiterateCallback){
        this._iterate(_cb,[])
    }

    indexValid(_idx : number){
        return (_idx >= 0) && (_idx < this.Fvalue.length)
    }

    deleteIdx(_idx : number){
        console.log("delete ",_idx)
        if (this.indexValid(_idx)){
            console.log("index value")
            const valueToDelete = this.Fvalue[_idx]
            this.Fvalue.splice(_idx,1)
            valueToDelete.cleanup()
            this.emitOnChange()
        }
    }

    deleteChild(_child : Tdescr){
        this.deleteIdx(this.Fvalue.indexOf(_child))
    }

    collectObserved(_observed : TobservedItem[], _path : Tpath){
        let firstObserved : Tdescr|null = null
        let lastObserved : Tdescr|null = null
        let observed = false
        //const path = _path.slice()
        //path.push(this.name)
        this.childs.forEach((child)=>{
            if (child.isStruct) (child as TstructDescr).collectObserved(_observed,[..._path,child.name])
            else if (child.isObserved){
                observed = true
                if (!firstObserved) firstObserved = child
                else lastObserved = child
            }
        })
        if (observed) _observed.push({path: _path, struct:this, first:firstObserved, last:lastObserved})
    }

    //virtual method only implemented by remoteServers to establish/close connections if necessary 
    checkActivation(){
        this.parent?.checkActivation()
    }

    push(descr : Tdescr){
        const idx = this.Fvalue.length
        this.Fvalue.push(descr)
        descr.idx = idx
        descr.parent = this
        this.emitOnChange()
    }

    cleanup(): void {
        console.log("TstructDescr.cleanup")
    }

    readValueArray(_arr : string[], first : number = 0){
        _arr.forEach((value)=>{
            if (first >= this.childs.length) return false
            //console.log(`setting ${this.childs[first].name}=${value}`)
            this.childs[first++].setValue(value)
        })
    }
}

function createDescr(_descr : any) : Tdescr{
    if (!_descr.hasOwnProperty(Tdescr.json_typeKey))  throw new Error(`missing ${Tdescr.json_typeKey} in "${_descr}"`)

    function _create() : Tdescr{
        switch(_descr.type){
            case Tdescr.type_uint8:
                if (_descr.hasOwnProperty(Tdescr.json_enumKey)) return new TenumDescr(_descr) 
                return new TnumberDescr()
            case Tdescr.type_uint16: return new TnumberDescr()
            case Tdescr.type_uint32: return new TnumberDescr()
            case Tdescr.type_uint64: return new TnumberDescr()

            case Tdescr.type_int8: return new TnumberDescr()
            case Tdescr.type_int16: return new TnumberDescr()
            case Tdescr.type_int32: return new TnumberDescr()
            case Tdescr.type_int64: return new TnumberDescr()

            case Tdescr.type_float32: return new TnumberDescr()
            case Tdescr.type_float64: return new TnumberDescr()

            case Tdescr.type_struct: return new TstructDescr(_descr)
        }
        throw Error(`invalid type ${_descr.type}`)
    }
    const res = _create()
    res.readJson(_descr)
    return res
}

