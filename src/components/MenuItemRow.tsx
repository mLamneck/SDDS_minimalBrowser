import { useMenuNavContext } from "./MenuNavContext"
import { Tdescr } from "../system/sdds/types"
import "../styles.css"
import useFocusHtmlElement from "../hooks/useFocusHtmlElement"
import MenuItemValue from "./MenuItemValue"
import { useObserver } from "../hooks/useObserver"

type TmenuItemRowProps = {
    item: Tdescr,
}

function MenuItemRow(props: TmenuItemRowProps) {
    const { item } = props
    //console.log(`render MenuItemRow ${item.name}`)
    
    const nav = useMenuNavContext()
    useObserver(nav.focusedRow)
    useObserver(nav.editing)

    const focus =  nav.focusedRow.value === item.idx && nav.editing.value === 0

    function onKeyDown(e : KeyboardEvent){
        switch(e.code){
            case "ArrowDown": return (nav.focusNext())
            case "ArrowUp": return (nav.focusPrev())
            case "ArrowRight": return (nav.startEdit())
            case "ArrowLeft": return (nav.leaveStruct())
        }
    }

    function onFocus(){
        nav.focusedRow.setValue(item.idx,false)
    }

    const ref = useFocusHtmlElement(focus)
    
    return (
        <div className={"editRow"}>
            <input 
                spellCheck={false} 
                readOnly={true} 
                className={"editField"} 
                name={item.name}
                type="text" 
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                value={item.name}
                ref={ref}
            />
            <MenuItemValue item={item}></MenuItemValue>
        </div>
    )
}

export default MenuItemRow