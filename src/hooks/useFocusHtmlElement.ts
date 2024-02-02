import { useEffect, useRef } from "preact/hooks"

function useFocusHtmlElement(focus : boolean) {
    const ref = useRef<HTMLInputElement>(null)
    useEffect(()=>{
        if (focus) ref.current?.focus()
    },[focus])
    return ref
}

export default useFocusHtmlElement