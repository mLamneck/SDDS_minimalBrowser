import { useState } from "preact/hooks"
import ErrorBoundary from "./components/ErrorBoundary"
import FlatBrowser from "./components/FlatBrowser"
import useCreateLocalMenuHook from "./hooks/useCreateLocalMenuHook"
import TremoteServer from "./system/RemoteServer"

type TserialProps = {
	server : TremoteServer,
	rerender: React.Dispatch<React.SetStateAction<boolean>>;
}

function Serial(props: TserialProps){
	const server = props.server;
	const rerender = props.rerender;

	const [connected, setConnected] = useState(false);

	async function connect(){
		if (await server.connectSerial()){
			setConnected(true);
		}
	}
	function close(){
		server.closeSerial(); 
		setConnected(false);
		rerender(false)
	}
	return<>
		<div className="flex-center-container">
			{connected?
					<div>
					<button onClick={close}>Close</button>
					</div>
				:<div>
					<button onClick={connect}>Connect to Serial Port</button>
				</div>
				}
			</div>
	</>	
}

export function App() {
	console.log("render app")
	console.log(window.location)

	const host = window.location.host;
	const [server, ] = useState(new TremoteServer(host))
	const [reconnect, setReconnect] = useState(true);

	//const struct = useCreateLocalMenuHook()
	const struct = server

	return (
	<>
		<ErrorBoundary>
		{struct ?
			<FlatBrowser struct={struct} />
			: null
		}
		{
			host?
			null: <Serial server={server} rerender={setReconnect}></Serial>
		}
		{/* <Status server={server} host={host}></Status> */}
		</ErrorBoundary>
	</>
	)
}
