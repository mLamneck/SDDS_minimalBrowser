import useRegisterValueChangeCallback, { useRerenderOnValueChange } from "../hooks/useRegisterValueChangeCallback"
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
    const [value, setValue, registerOnChangeCallback, unregisterOnChangeCallback] = useRegisterValueChangeCallback(item)

    //toDo rename to editStarted
    function onEditStarted(){
        unregisterOnChangeCallback()
        nav.editStarted(item)
    }

    function onCancelEdit(){
        registerOnChangeCallback()
        nav.cancelEdit()
    }

    function onEditDone(){
        nav.editCanceled()
        registerOnChangeCallback()
    }

    function onFinishEdit(value: any){
        onCancelEdit()
        console.log("MenuItemValue. onFinishEdit",value)
        item.setValue(value)
    }

    const commonProps = {
        item,
        editing,
        value,

        setValue,
        onStartEdit: ()=>{},
        onEditStarted,
        onCancelEdit,
        onFinishEdit,
        onEditDone
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