import { useState, useEffect } from 'preact/hooks'
import { TstructDescr, TenumDescr } from '../system/sdds/types' 

function useCreateLocalMenuHook(){
    const [struct, setStruct] = useState<TstructDescr>()
    console.log("useCreateLocalMenuHook 1")

    useEffect(() => {
        console.log(`create new struct in useEffect`)
        //create a structure with some values to test from a json string
        //like it would usually be retrieved by some device
        const struct = new TstructDescr("myFakeWebsocket")
        let menuDefStr = `[
        {"type":1, "name": "byte", "opt":1, "value": 1}
        ,{"type":2, "name": "word", "opt":1, "value": 2}
        ,{"type":1, "name": "action", "opt":0, "value": 0, "enums": ["___","open","close","emergency"]}
        ,{"type":1, "name": "actionRO", "opt":1, "value": 0, "enums": ["___","cooldown","warmup"]}
        ,{"type":66, "name": "settings", "opt":0, "value": [
          {"type":1, "name": "filter", "opt":0, "value": 10}
          ,{"type":66, "name": "sub", "opt":0, "value": [
            {"type":1, "name": "byte", "opt":1, "value": 1}
          ]}
        ]}
        ,{"type":2, "name": "last", "opt":0, "value": 2}
      ]`
        menuDefStr = '[{"type":1,"opt":1,"name":"cntSwitch","value":"on","enums":["on","off"]},{"type":1,"opt":1,"name":"Fcnt","value":5},{"type":66,"opt":0,"name":"sub","value":[{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value21","value":7.50},{"type":4,"opt":0,"name":"time1","value":1000},{"type":1,"opt":0,"name":"led","value":"off","enums":["on","off"]}]},{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value","value":0.00},{"type":36,"opt":0,"name":"fValue","value":0.00}]'
        struct.parseJsonStr(menuDefStr)
        console.log("settings struct")
        setStruct(struct)

        //emulate some changes in values, that would usually be triggered 
        //by updates received from devices over webSocket
        function handleTimer() {
            //console.log("timer")
            //console.log(struct)
            struct.childs.forEach(item => {
                switch (item.baseType) {
                    case 'enum' : {
                        const enums = (item as TenumDescr).enums
                        item.setValue(item.value + 1 < enums.length ? item.value + 1 : 0)
                        break
                    }
                    case 'struct': break
                    default: item.setValue(item.value + 1)
                }
            })
        }

        const timerIntv = window.setInterval(handleTimer, 1000)
        return () => {
            window.clearInterval(timerIntv)
        }
    }, [])

    return struct
}

export default useCreateLocalMenuHook