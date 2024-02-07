import {useCallback, useEffect, useRef, useState, StateUpdater, MutableRef} from 'preact/hooks'
import { Tdescr, TobserverObj } from '../system/sdds/types'

type TuseRegisterObserverRes = {
    observer : MutableRef<TobserverObj>, 
    value : any, 
    setValue:StateUpdater<any> 
}

export function useRegisterObserver(item : Tdescr) : TuseRegisterObserverRes{
    const observer = useRef<TobserverObj>(new TobserverObj(()=>{}))
    const [value, setValue] = useState(item.value)
    
    useEffect(()=>{
        const newObserver = item.observers.add(()=> setValue(item.value))
        if (newObserver) observer.current = newObserver 
        return ()=>{
            item.observers.remove(observer.current)
        }
    },[item])

    return {observer, value, setValue}
}

export function useRegisterObserver1(item : Tdescr){
    const {observer, value, setValue} = useRegisterObserver(item)
    function registerOnChangeCallback(){
        observer.current.setActive(true)
    }

    function unregisterOnChangeCallback(){
        observer.current.setActive(false)
    }
    return [value, setValue, registerOnChangeCallback, unregisterOnChangeCallback]
}

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