import { useState } from "preact/hooks"
import useFocusHtmlElement from "../../hooks/useFocusHtmlElement"
import { TstructDescr } from "../../system/sdds/types"
import { useMenuNavContext } from "../MenuNavContext"
import { TCommonProps } from "./CommonProps"


function Edit({item, editing} : TCommonProps) {
    const nav = useMenuNavContext()
    const ref = useFocusHtmlElement(editing,true)

    function onFocus(){
        console.log(`Edit: onFocus ${item.name}`)
        ref.current?.select()
        nav.editStarted(item)
    }

    function onClick(){
        console.log(`Edit: on click ${item.name}`)
        if (item.isStruct) nav.enterStruct(item as TstructDescr)
    }

    function cancelEdit(){ 
        console.log(`Edit: on blur ${item.name}`)
        nav.cancelEdit()
    }

    function onKeyDown(e : KeyboardEvent){
        switch(e.code){
            case "Escape": case "ArrowLeft": return cancelEdit()
            case "Enter": return cancelEdit()
        }
    }

    let type = "number"
    //let disabled = false
    if (item.isStruct){
        type = "text"
        //disabled = (item as TstructDescr).isEmpty
    }

    return (
        <input 
            className={`editField ${item.readonly?'readonly':''}`} 
            type={type} 
            name={item.name}
            value={item.value}
            readOnly={item.readonly}

            onFocus={onFocus}
            onBlur={()=>nav.editCanceled()}
            onKeyDown={onKeyDown}
            onMouseDown={onClick}

            ref={ref}
        />
    )
}

export default Edit