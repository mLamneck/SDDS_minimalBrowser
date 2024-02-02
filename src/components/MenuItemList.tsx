import { TstructDescr } from "../system/sdds/types"
import MenuItemRow from "./MenuItemRow"

type TmenuItemListProps = {
    struct : TstructDescr
}

function MenuItemList({struct}: TmenuItemListProps) {    
    return <>
        {
            struct.childs.map((c)=>{
                return <MenuItemRow 
                    key={c.name}
                    item={c}
                />
            })
        }
    </>
}

export default MenuItemList