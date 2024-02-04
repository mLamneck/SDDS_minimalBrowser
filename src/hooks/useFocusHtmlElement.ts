import { useEffect, useRef } from "preact/hooks"

function useFocusHtmlElement<T extends HTMLElement = HTMLInputElement>(focus : boolean) {
    const ref = useRef<T>(null)

    //empty dependecy array -> we want to trigger this regardless
    //if variable focus has changed or not to make sure we are
    //setting the focus if neccessary. This can happen, because we
    //are not rerendering everytime.
    useEffect(()=>{
        if (ref.current && focus) ref.current.focus()
    })
    return ref
}

export default useFocusHtmlElement