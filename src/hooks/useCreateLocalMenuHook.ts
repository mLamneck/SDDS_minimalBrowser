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
        ,{"type":49, "name": "action", "opt":0, "value": 0, "enums": ["___","open","close","emergency"]}
        ,{"type":49, "name": "actionROandAprettyLongName", "opt":1, "value": 0, "enums": ["___","cooldown","warmup"]}
        ,{"type":66, "name": "settings", "opt":0, "value": [
          {"type":1, "name": "filter", "opt":0, "value": 10}
          ,{"type":66, "name": "sub", "opt":0, "value": [
            {"type":1, "name": "byte", "opt":1, "value": 1}
          ]}
        ]}
        ,{"type":1, "name": "time", "opt":0, "value": "10.10.2034 10:00:00"}
        ,{"type":2, "name": "last", "opt":0, "value": 2}
        ,{"type":129, "name": "str", "opt":0, "value": "ein langer string"}
      ]`
	  menuDefStr = `
		{"e":{"0":["OFF","ON"]},"d":[{"t":40,"n":"val","v":0},{"t":66,"n":"PARTICLE_IO","v":[{"t":49,"o":128,"n":"publish","e":0,"v":"OFF"},{"t":66,"n":"variables","v":[{"t":66,"n":"val","v":[{"t":4,"o":128,"n":"UpdateTime","v":0},{"t":1,"o":128,"n":"decimals","v":2}]}]},{"t":129,"o":8,"n":"func","v":""},{"t":129,"o":8,"n":"param","v":""},{"t":20,"n":"funcRes","v":0},{"t":20,"n":"logChs","v":0}]}]}
	  `
	  menuDefStr = `
		{"e":{"0":["ON","OFF"],"1":["warmup","cooldown"],"2":["OFF","ON"]},"d":[[66,0,"CH0",[[49,0,"myswitch",0],[49,0,"heatState",1],[36,0,"input"],[36,0,"output"],[40,0,"float64"]]],[66,0,"CH1",[[49,0,"myswitch",0],[49,0,"heatState",1],[36,0,"input"],[36,0,"output"],[40,0,"float64"]]],[66,0,"CH2",[[49,0,"myswitch",0],[49,0,"heatState",1],[36,0,"input"],[36,0,"output"],[40,0,"float64"]]],[66,0,"PARTICLE_IO",[[49,128,"publish",2],[66,0,"variables",[[66,0,"CH0",[[66,0,"myswitch",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"heatState",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"input",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"output",[[4,128,"UpdateTime"],[1,128,"decimals"]]]]],[66,0,"CH1",[[66,0,"myswitch",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"heatState",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"input",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"output",[[4,128,"UpdateTime"],[1,128,"decimals"]]]]],[66,0,"CH2",[[66,0,"myswitch",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"heatState",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"input",[[4,128,"UpdateTime"],[1,128,"decimals"]]],[66,0,"output",[[4,128,"UpdateTime"],[1,128,"decimals"]]]]]]],[129,8,"func"],[129,8,"param"],[20,0,"funcRes"],[20,0,"logChs"]]]]}	  
	  `
/*
*/
        //menuDefStr = '[{"type":1,"opt":1,"name":"cntSwitchAprettyLongName","value":"on","enums":["on","off"]},{"type":1,"opt":1,"name":"Fcnt","value":5},{"type":66,"opt":0,"name":"sub","value":[{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value21","value":7.50},{"type":4,"opt":0,"name":"time1","value":1000},{"type":1,"opt":0,"name":"led","value":"off","enums":["on","off"]}]},{"type":1,"opt":0,"name":"filter","value":10},{"type":36,"opt":0,"name":"value","value":0.00},{"type":36,"opt":0,"name":"fValue","value":0.00}]'
        struct.parseJsonStr(menuDefStr)
        console.log("settings struct")
        setStruct(struct)

        //emulate some changes in values, that would usually be triggered 
        //by updates received from devices over webSocket
        function handleTimer() {
            //console.log("timer")
            //console.log(struct)
            if (struct.childs[0].value === 1) return
            struct.childs.forEach(item => {
                switch (item.baseType) {
                    case 'enum' : {
                        const enums = (item as TenumDescr).enums
                        //item.setValue(item.value + 1 < enums.length ? item.value + 1 : 0)
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