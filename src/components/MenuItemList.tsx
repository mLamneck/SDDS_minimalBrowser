import { useRerenderOnValueChange } from "../hooks/useRegisterValueChangeCallback";
import MenuItemRow from "./MenuItemRow"
import { useMenuNavContext } from "./MenuNavContext"

function MenuItemList() {  
    const nav = useMenuNavContext()
    const struct = nav.struct

    useRerenderOnValueChange(struct)
    return <>
        <div className={"verticalContainer"}>
            {
            struct.childs.map((c)=>{
                return <MenuItemRow 
                    key={c.name}
                    item={c}
                />
            })
            }
            {nav.isRoot ? null :
                <div className={"centerDiv"}>
                    <button className={"backButton"} onClick={()=>nav.leaveStruct()}>GoBack</button>
                </div>
            }
        </div>
    </>
}

export default MenuItemList