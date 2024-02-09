import { useEffect, useRef, useState, StateUpdater, MutableRef } from 'preact/hooks'
import { Tdescr, Tobserver } from '../system/sdds/types'

type TuseRegisterObserverRes = {
    observer : MutableRef<Tobserver>, 
    value : any, 
    setValue : StateUpdater<any> 
}

export function useObserver(item : Tdescr, _forceRerender : boolean = true) : TuseRegisterObserverRes{
    const observer = useRef<Tobserver>(new Tobserver(item, ()=>{}))
    const [value, setValue] = useState(item.value)
    const [, setDummy] = useState(0)
    
    useEffect(()=>{
        const onValueChange = _forceRerender ? ()=>setDummy((prev)=>prev+1)
            : ()=>setValue(item.value)
        const newObserver = item.observers.add(onValueChange)
        if (newObserver) observer.current = newObserver 
        return ()=>{
            item.observers.remove(observer.current)
        }
    },[item, _forceRerender])

    return {observer, value, setValue}
}