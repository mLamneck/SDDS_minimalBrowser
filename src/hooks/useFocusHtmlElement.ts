import { useEffect, useRef } from "preact/hooks"

function useFocusHtmlElement(focus : boolean, select = false) {
    const ref = useRef<HTMLInputElement>(null)
    useEffect(()=>{
        if (ref.current && focus){
            ref.current.focus()
            if (select) ref.current.select()
        }
    },[focus, select])
    return ref
}

export default useFocusHtmlElement