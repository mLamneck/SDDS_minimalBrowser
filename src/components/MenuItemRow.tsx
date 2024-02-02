import { useMenuNavContext } from "./MenuNavContext"
import { useRerenderOnValueChange } from "../hooks/useRegisterValueChangeCallback"
import { Tdescr } from "../system/sdds/types"
import "../styles.css"
import useFocusHtmlElement from "../hooks/useFocusHtmlElement"
import MenuItemValue from "./MenuItemValue"

type TmenuItemRowProps = {
    item: Tdescr,
}

function MenuItemRow(props: TmenuItemRowProps) {
    console.log("render MenuItemRow")
    const { item } = props
    
    const nav = useMenuNavContext()
    useRerenderOnValueChange(nav.focusedRow)    
    useRerenderOnValueChange(nav.editing)    
    useRerenderOnValueChange(item)  

    const focus =  nav.focusedRow.value === item.idx && nav.editing.value === 0

    function onKeyDown(e : KeyboardEvent){
        console.log("key down",e)
        switch(e.code){
            case "ArrowDown":
                nav.focusNext()
                break
            case "ArrowUp":
                nav.focusPrev()
                break
            case "ArrowRight":
                nav.enterValue()
                break    
        }
    }

    function onFocus(){
        nav.focusedRow.setValue(item.idx,false)
    }

    const ref = useFocusHtmlElement(focus)
    
    return (
        <div>
            <div className={"editRow"}>
                <input 
                    spellCheck={false} 
                    readOnly={true} 
                    className={"editField"} 
                    type="text" 
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    value={item.name}
                    ref={ref}
                />
                <MenuItemValue item={item}></MenuItemValue>
            </div>
        </div>
    )
}

export default MenuItemRow