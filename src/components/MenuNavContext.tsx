import { createContext, ComponentChildren } from "preact";
import { useContext } from "preact/hooks";
import { TnumberDescr, TstructDescr } from "../system/sdds/types";

class TmenuNavStateClass extends TstructDescr{
    private FfocusedRow = new TnumberDescr();
    private Fediting = new TnumberDescr();
    private FrootStruct : TstructDescr;
    private FcurrStruct : TstructDescr;

    get focusedRow() { return this.FfocusedRow }
    get editing() { return this.Fediting }

    get focusedItem() { return this.FrootStruct.childs[this.FfocusedRow.value] }
    get struct() { return this.FcurrStruct }

    get isRoot() { return this.struct == this.FrootStruct}
    
    constructor(_struct : TstructDescr){
        super()
        this.FrootStruct = _struct
        this.FcurrStruct = _struct
    }

    focusNext(){
        const v = this.FfocusedRow.value
        if (v + 1 >= this.FrootStruct.childs.length) return
        this.FfocusedRow.value = this.FfocusedRow.value + 1;
    }

    focusPrev(){
        const v = this.FfocusedRow.value
        if (v <= 0) return
        this.FfocusedRow.value = v-1;
    }

    enterValue(){
        const item = this.focusedItem
        if (!item) return
        if (item.isStruct){
            this.FcurrStruct.emitOnChange()
            this.FcurrStruct = item as TstructDescr
            this.FfocusedRow.value = 0
        }
        else{
            this.Fediting.value = 1
        }
    }
    leaveStruct(){
        if (this.struct.parent){
            this.struct.emitOnChange()
            this.FcurrStruct = this.struct.parent
            this.FfocusedRow.value = 0
        }
    }

    cancelEdit(){
        this.Fediting.value = 0
    }
} 


const MenuNavContext = createContext<TmenuNavStateClass>(new TmenuNavStateClass(new TstructDescr()))

type TmenuNavProviderProps = {
    children : ComponentChildren
    root : TstructDescr
}

function MenuNavProvider({root, children} : TmenuNavProviderProps) {
    const navState = new TmenuNavStateClass(root);

    return (
        <MenuNavContext.Provider value={navState}>
            {children}
        </MenuNavContext.Provider>
    )
}

export default MenuNavProvider

export function useMenuNavContext(){ 
    return useContext(MenuNavContext)
}