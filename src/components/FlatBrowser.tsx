import { useObserver } from "../hooks/useObserver"
import { TstructDescr } from "../system/sdds/types"
import MenuItemList from "./MenuItemList"
import MenuNavProvider, { useMenuNavContext } from "./MenuNavContext"

function Status() {
  const nav = useMenuNavContext()
  useObserver(nav.status)

  return (
    <div>status = {nav.status.value}</div>
  )
}

type TflatBrowserProps = {
  struct : TstructDescr
}

function FlatBrowser({struct} : TflatBrowserProps) {
  return (
    <MenuNavProvider root={struct}>
      <div className="card">
        <MenuItemList/>
        {/* <Status></Status> */}
      </div>
    </MenuNavProvider>
  )
}

export default FlatBrowser