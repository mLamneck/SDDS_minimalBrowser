import { TstructDescr } from "../system/sdds/types"
import MenuItemList from "./MenuItemList"
import MenuNavProvider from "./MenuNavContext"

type TflatBrowserProps = {
    struct : TstructDescr
}

function FlatBrowser({struct} : TflatBrowserProps) {
  return (
    <MenuNavProvider root={struct}>
        <MenuItemList/>
    </MenuNavProvider>
  )
}

export default FlatBrowser