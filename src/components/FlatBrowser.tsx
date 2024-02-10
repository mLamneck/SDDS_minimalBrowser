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

const wrapperStyle = {
  display: "flex",
  justifyContent: "center",
}

const cardStyle = {
  width: "auto",
  marginBlock: "20px",
  paddingTop: "10px",
  backgroundColor: "#F5F5F5",
  borderRadius: "8px",
  boxShadow:"0 0.5rem 1.5rem rgb(0 5 100 / 0.3)"
}

function FlatBrowser({struct} : TflatBrowserProps) {
  return (
    <MenuNavProvider root={struct}>
        <div style={wrapperStyle}>
          <div style={cardStyle}>
            <MenuItemList/>
            {/* <Status></Status> */}
          </div>
        </div>
    </MenuNavProvider>
  )
}

export default FlatBrowser