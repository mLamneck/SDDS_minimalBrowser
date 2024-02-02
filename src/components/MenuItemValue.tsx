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
        ref.current?.select()
    }

    function cancelEdit(){ 
        nav.cancelEdit()
    }

    function onKeyDown(e : KeyboardEvent){
        switch(e.code){
            case "Escape": case "ArrowLeft": return cancelEdit()
            case "Enter": break
        }
    }

    return (
        <input 
            className={"editField"} 
            type="text" 
            value={item.value}

            onFocus={onFocus}
            onBlur={cancelEdit}
            onKeyDown={onKeyDown}

            ref={ref}
        />
    )
}

export default MenuItemValue