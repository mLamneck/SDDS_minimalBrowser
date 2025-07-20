import { WebsocketConnector } from "../system/WebsocketConnector";
import { useEffect } from "preact/hooks";

export function WebsocketConnectorGui({ comm }: { comm: WebsocketConnector }) {

	useEffect(()=>{
		console.log("sfkasjkd")
		comm.connect();
	})

	return<>
	</>	
}
