import { TstructDescr } from "../system/sdds/types"
import MenuItemList from "./MenuItemList"
import MenuNavProvider, { useMenuNavContext } from "./MenuNavContext"
import React from 'preact/compat';

type TflatBrowserProps = {
  struct : TstructDescr
  children?: React.ReactNode;
}

function FlatBrowser({struct, children} : TflatBrowserProps) {
  return (
	<MenuNavProvider root={struct}>
		<MenuItemList/>
		{children}
	</MenuNavProvider>
  )
}

export default FlatBrowser