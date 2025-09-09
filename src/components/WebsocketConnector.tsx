import { WebsocketConnector } from "../system/WebsocketConnector";
import { useEffect, useState } from "preact/hooks";

export function WebsocketConnectorGui({ comm }: { comm: WebsocketConnector }) {
	const [onInit, setOnInit] = useState(true)
	const [error, setError] = useState("")
	const [connected, setConnected] = useState(false)

	comm.callbacks.subscribe({
		"onclose" : () =>{ setConnected(false); },
		"onopen" : () =>{ setConnected(true); },
		"onreconnect": () => {},
		"onerror" : (err) => { setError(err); }
	}
	)
	useEffect(()=>{
		if (onInit){
			setOnInit(false);
			comm.connect();
		}
	})

	return<>
		<div className="connection-status">
		{connected ? (
			<div className="status-block">
				<div className="status-row">
					<span className="status-label">{comm.Addr}:</span>
					<span className="status-indicator connected">Connected</span>
				</div>
			</div>
		) : (
			<div className="status-block">
				<div className="status-row">
					<span className="status-label">{comm.Addr}:</span>
					<span className="status-indicator disconnected">Not Connected</span>
				</div>
				{error && (
					<div className="error-message status-indicator disconnected">
					{error}
					</div>
				)}
			</div>
		)}
		</div>
	</>	

}
