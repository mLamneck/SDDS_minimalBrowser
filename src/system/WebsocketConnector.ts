import {IComm, CommCallbackManager, CommCallbacks} from "./CommInterface"
import Sockette from 'sockette';
import { TjsTimeout } from "./types"

export class WebsocketConnector implements IComm {
	public callbacks = new CommCallbackManager();
	private Fsocket : Sockette|undefined
	public Addr = ""
	private FpingTimer : TjsTimeout|null = null
	
	async connect() {
		console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Try to connect to WebSocket")
		let addr = `ws://${window.location.host}/ws`;
		if (window.location.host === "localhost:3000"){
			addr = `ws://192.168.4.1/ws`
			addr = `ws://192.168.178.48/ws`
			addr = `ws://192.168.178.37/ws`
			console.warn("using fixed addr to reach out to ESP in dev mode ... ",addr)
		}
		console.log("open websocket ... ",addr)
		this.Addr = addr;

		const ws = new Sockette(addr, {
			timeout: 5,
			//maxAttempts: 100,
			onopen: () => {
				console.log("websocket on open")
				this.callbacks.emitOpen()
				this.startPingTimer();
			},
			onmessage: (e: MessageEvent) => this.callbacks.emitMessage(e.data),
			onreconnect: () => {
				console.log("websocket reconnect")
				this.callbacks.emitReconnect(1)
			},
			onmaximum: e => console.log('Stop Attempting!', e),
			onclose: () => {
				console.log('websocket close')
				this.callbacks.emitClose()
				this.stopPingTimer();
			},
			onerror: e => {
				console.log('websocket Error:', e)
				this.callbacks.emitError(e);
			}
		});
		this.Fsocket = ws	

		return false
	}
	
	async send(msg: string): Promise<void> {
		this.Fsocket?.send(msg)
		this.startPingTimer();
	}

	async close() {
		this.callbacks.emitClose();
	}

	pingHandler(){
		this.FpingTimer = null
		this.send("0")
		this.startPingTimer();
	}

	stopPingTimer(){
		if (this.FpingTimer) clearTimeout(this.FpingTimer)
	}

	startPingTimer(){
		this.stopPingTimer();
		this.FpingTimer = setTimeout(()=>{this.pingHandler()},1000)
	}
	
}