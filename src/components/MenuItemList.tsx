import { useObserver } from "../hooks/useObserver"
import MenuItemRow from "./MenuItemRow"
import { useMenuNavContext } from "./MenuNavContext"

function MenuItemList() {  
    const nav = useMenuNavContext()
    const struct = nav.struct

    useObserver(struct)
	return (
	<>
		<div className="itemList-layout-grid">
			{struct.childs.map((c) => (
				<MenuItemRow key={c.name} item={c} />
			))}

			{!nav.isRoot && (
				<div className="arrow-left" onClick={() => nav.leaveStruct()} />
			)}
		</div>
	</>
	);
}

export default MenuItemList