import { useState,useRef } from "preact/hooks"
import ErrorBoundary from "./components/ErrorBoundary"
import FlatBrowser from "./components/FlatBrowser"
import useCreateLocalMenuHook from "./hooks/useCreateLocalMenuHook"
import TremoteServer from "./system/RemoteServer"

/**
 * Switch between builds for different communication channels:
 *  - Serial
 *  - WebSocket
 *  - ParticleIO
 *
 * Each communication channel must provide:
 *  1. A `xxxConnector.ts` file implementing the connection logic
 *  2. A corresponding `xxxConnector.tsx` file implementing the UI
 *
 * Example:
 *  - ParticleIO: requires input fields for device ID and access token
 *  - Serial: requires buttons for connect/disconnect actions
 *
 * Currently, switching between communication channels is done manually
 * by commenting/uncommenting the respective import blocks below.
 */
//import { ParticleComm as Comm } from './system/ParticleConnector'
//import { ParticleConnectorGui as CommGui } from "./components/ParticleConnector"
import { SerialConnector as Comm } from "./system/SerialConnector"
import { SerialConnectorGui as CommGui } from "./components/SerialConnector"
//import { WebsocketConnector as Comm } from "./system/WebsocketConnector"
//import { WebsocketConnectorGui as CommGui } from "./components/WebsocketConnector"

export function App() {
	console.log("render app")
	console.log(window.location)

	const commRef = useRef<Comm>(new Comm);
	const host = window.location.host;
	const [server, ] = useState(new TremoteServer(commRef.current,host))

	//const struct = useCreateLocalMenuHook()
	const struct = server

	return (
	<>
		<ErrorBoundary>
		{struct ?
			<div className="card">
				<FlatBrowser struct={struct}>
				</FlatBrowser>
				<CommGui comm={commRef.current}></CommGui>
			</div>
			: null
		}
		{/* <Status server={server} host={host}></Status> */
		}
		</ErrorBoundary>
	</>
	)
}
