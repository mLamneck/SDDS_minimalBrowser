import { TstructDescr } from "../system/sdds/types"
import MenuItemList from "./MenuItemList"
import MenuNavProvider, { useMenuNavContext } from "./MenuNavContext"

type TflatBrowserProps = {
  struct : TstructDescr
}

function FlatBrowser({struct} : TflatBrowserProps) {
  return (
    <MenuNavProvider root={struct}>
      <div className="card">
        <MenuItemList/>
      </div>
    </MenuNavProvider>
  )
}

export default FlatBrowser