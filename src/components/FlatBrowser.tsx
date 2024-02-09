import { useObserver } from "../hooks/useObserver"
import { TstructDescr } from "../system/sdds/types"
import MenuItemList from "./MenuItemList"
import MenuNavProvider, { useMenuNavContext } from "./MenuNavContext"

type TflatBrowserProps = {
    struct : TstructDescr
}

function Status() {
  const nav = useMenuNavContext()
  useObserver(nav.status)

  return (
    <div>status = {nav.status.value}</div>
  )
}

function FlatBrowser({struct} : TflatBrowserProps) {
  return (
    <MenuNavProvider root={struct}>
        <MenuItemList/>
        <Status></Status>
    </MenuNavProvider>
  )
}

export default FlatBrowser