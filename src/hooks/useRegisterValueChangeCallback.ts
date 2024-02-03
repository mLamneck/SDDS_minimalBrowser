import {useCallback, useEffect, useState} from 'preact/hooks'
import { Tdescr } from '../system/sdds/types'

function useRegisterValueChangeCallback(item : Tdescr, installCallback : boolean = true) {
    const [value, setValue] = useState(item.value)

    //useCallback -> make sure function is not recreated on render
    const onValueChange = useCallback(()=>{
        setValue(item.value)
    },[item])

    function registerOnChangeCallback(){
        item.registerOnChangeCallback(onValueChange)
    }

    function unregisterOnChangeCallback(){
        item.unregisterOnChangeCallback(onValueChange)
    }

    useEffect(()=>{
        if (installCallback) item.registerOnChangeCallback(onValueChange)
        return () => {
            item.unregisterOnChangeCallback(onValueChange)
        }
    },[item,onValueChange,installCallback])

    return [value, setValue, registerOnChangeCallback, unregisterOnChangeCallback]
}

export function useRerenderOnValueChange(item : Tdescr, active = true){
    const [,setTrigger] = useState(0)
    
    const onValueChange = useCallback(()=>{
        setTrigger(prev=>prev+1)
    },[])

    useEffect(()=>{
        if (active) item.registerOnChangeCallback(onValueChange)
        return () => {
            item.unregisterOnChangeCallback(onValueChange)
        }
    },[item,onValueChange,active])
}

export function useOnValueChange(_item : Tdescr, _onValueChange : ()=>void){    
    const onValueChange = useCallback(()=>{
        _onValueChange()
    },[_onValueChange])

    useEffect(()=>{
        _item.registerOnChangeCallback(onValueChange)
        return () => {
            _item.unregisterOnChangeCallback(onValueChange)
        }
    },[_item,onValueChange])

}

export default useRegisterValueChangeCallback