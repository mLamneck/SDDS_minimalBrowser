import useFocusHtmlElement from "../hooks/useFocusHtmlElement"
import { useRerenderOnValueChange } from "../hooks/useRegisterValueChangeCallback"
import { Tdescr } from "../system/sdds/types"
import { useMenuNavContext } from "./MenuNavContext"

type TmenuItemValueProps = {
    item : Tdescr
}

function MenuItemValue({item} : TmenuItemValueProps) {
    const nav = useMenuNavContext()

    useRerenderOnValueChange(nav.focusedRow)    
    useRerenderOnValueChange(nav.editing)    
    useRerenderOnValueChange(item)    
    const editing = nav.focusedRow.value === item.idx && nav.editing.value === 1

    const ref = useFocusHtmlElement(editing)
   
    function onFocus(){
        if (item.isStruct) return
        ref.current?.select()
    }

    function cancelEdit(){ 
        nav.cancelEdit()
    }

    function onKeyDown(e : KeyboardEvent){
        switch(e.code){
            case "Escape": case "ArrowLeft": return cancelEdit()
            case "Enter": return cancelEdit()
        }
    }

    function onClick(){
        nav.focusedRow.setValue(item.idx,false)
        nav.enterValue()
    }

    return (
        <input 
            className={"editField"} 
            type="text" 
            name={item.name}
            value={item.value}
            readOnly={!item.editable}

            onFocus={onFocus}
            onBlur={cancelEdit}
            onKeyDown={onKeyDown}
            onClick={onClick}

            ref={ref}
        />
    )
}

export default MenuItemValue