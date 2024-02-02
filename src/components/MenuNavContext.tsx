import { createContext, ComponentChildren } from "preact";
import { useContext } from "preact/hooks";
import { TnumberDescr, TstructDescr } from "../system/sdds/types";

class TmenuNavStateClass extends TstructDescr{
    private FfocusedRow = new TnumberDescr();
    private Fediting = new TnumberDescr();
    private FrootStruct : TstructDescr;

    get focusedRow() { return this.FfocusedRow }
    get editing() { return this.Fediting }

    get focusedItem() { return this.FrootStruct.childs[this.FfocusedRow.value] }
    
    constructor(_struct : TstructDescr){
        super()
        this.FrootStruct = _struct
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
        console.log("-> enterValue",item)
        if (!item) return
        if (item.isStruct){

        }
        else{
            console.log("set editing = 1")
            this.Fediting.value = 1
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