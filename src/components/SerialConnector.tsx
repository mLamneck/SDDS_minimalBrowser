import { useState } from "preact/hooks";
import { SerialConnector } from "../system/SerialConnector";

export function SerialConnectorGui({ comm }: { comm: SerialConnector }) {
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState("")

	const connect = () => {
		comm.connect();
	};

	const disconnect = async () => {
		await comm.close();
	};

	comm.callbacks.subscribe({
		onclose : () => { 
			setConnected(false); 
		},
		onopen : () => { 
			setError(""); 
			setConnected(true); 
		},
		onerror : (err) => { 
			setError(err); 
			setConnected(false); 
		}
	});

	return<>
		<div className="connection-status">
		{connected ? (
			<div className="status-block">
				<div className="status-row">
					<button onClick={disconnect}>Close</button>
					<span className="status-label">Serial:</span>
					<span className="status-indicator connected">Connected</span>
				</div>
			</div>
		) : (
			<div className="status-block">
				<div className="status-row">
					<button onClick={connect}>Connect to Serial Port</button>
					<span className="status-label">Serial:</span>
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
