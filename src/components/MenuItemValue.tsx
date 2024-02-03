import useFocusHtmlElement from "../hooks/useFocusHtmlElement"
import { useRerenderOnValueChange } from "../hooks/useRegisterValueChangeCallback"
import { Tdescr } from "../system/sdds/types"
import { useMenuNavContext } from "./MenuNavContext"
import Edit from "./itemDisplayComponents/Edit"
import Select from "./itemDisplayComponents/Select"

type TmenuItemValueProps = {
    item : Tdescr
}

function MenuItemValue({item} : TmenuItemValueProps) {
    //console.log(`render MenuItemValue ${item.name}`)
    const nav = useMenuNavContext()
    const editing = nav.focusedRow.value === item.idx && nav.editing.value === 1   

    useRerenderOnValueChange(nav.focusedRow)
    useRerenderOnValueChange(nav.editing)
    useRerenderOnValueChange(item,!editing)

    const commonProps = {
        item,
        editing,

        setValue: (value: any)=>{},
        onStartEdit: ()=>{},
        onCancelEdit: ()=>{},
        onFinishEdit: (value: any)=>{},
    }

    //how does this work in jsx below? #1
    //const test = {...commonProps, item: item as TenumDescr}
    switch(item.baseType){
        case 'enum': 
            return <Select {...commonProps}></Select>
        case 'int': case 'uint' : case 'float' : case 'struct': 
            return <Edit {...commonProps}></Edit>
        default: 
    }
    return <></>
}

export default MenuItemValue