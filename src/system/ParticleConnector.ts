import { TjsTimeout } from "./types"
import {IComm, CommCallbackManager, CommCallbacks} from "./CommInterface"

export class ParticleComm implements IComm {
  private accessToken: string = "";
  private deviceId: string = "";
  private fromEvent: string = 'sdds_fromDev';
  private toEvent: string = 'sdds_toDev';
  private streamController: AbortController | null = null;
  private reconnectAttempts = 0;
  public callbacks = new CommCallbackManager();
  private Ftimeout : TjsTimeout|null = null;

/*
  constructor(deviceId: string, accessToken: string, callbacks: Callbacks = {}) {
	this.deviceId = deviceId;
	this.accessToken = accessToken;
	this.callbacks = callbacks;

	this.connect();
  }
*/
  private async _connect() {
	//const url = `https://api.particle.io/v1/devices/${this.deviceId}/events/${this.fromEvent}`;
	const url = `https://api.particle.io/v1/devices/events/${this.fromEvent}`;
	this.streamController = new AbortController();

	try {
	  const response = await fetch(url, {
		headers: {
		  Authorization: `Bearer ${this.accessToken}`,
		},
		signal: this.streamController.signal,
	  });

	  if (!response.ok || !response.body) {
		throw new Error(`Stream connection failed: ${response.statusText}`);
	  }

	  this.callbacks.emitOpen();

	  const reader = response.body.getReader();
	  const decoder = new TextDecoder('utf-8');
	  let buffer = '';

	  while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });

		const parts = buffer.split('\n\n');
		buffer = parts.pop() || '';

		for (const part of parts) {
		  const lines = part.split('\n');
		  const dataLine = lines.find((line) => line.startsWith('data:'));
		  if (dataLine) {
			const json = JSON.parse(dataLine.slice(5).trim());
			this.callbacks.emitMessage(json.data);
		  }
		}
	  }
	} catch (err) {
		this.callbacks.emitError(err);
		this.callbacks.emitClose();
		//this.tryReconnect();
	}
  }

  async connect(deviceId: string, accessToken: string, callbacks: CommCallbacks) {
	this.deviceId = deviceId;
	this.accessToken = accessToken;
	this.callbacks.subscribe(callbacks);
	this._connect();
  }

  private tryReconnect() {
	this.reconnectAttempts++;
	const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
	this.callbacks.emitReconnect(this.reconnectAttempts)
	this.Ftimeout = setTimeout(() => this._connect(), delay);
  }

  public send(msg: string): Promise<void> {
	const url = `https://api.particle.io/v1/devices/events`;

	const formData = new URLSearchParams({
	  name: this.toEvent,
	  data: msg,
	  private: 'true',
	});

	console.log(formData.toString());

	return fetch(url, {
	  method: 'POST',
	  headers: {
		'Authorization': `Bearer ${this.accessToken}`,
		'Content-Type': 'application/x-www-form-urlencoded',
	  },
	  body: formData.toString(),
	}).then((res) => {
	  if (!res.ok) {
		return res.text().then(text => {
		  throw new Error(`Particle publish failed: ${text}`);
		});
	  }
	});
  }

  public close() {
	if (this.Ftimeout)
		clearTimeout(this.Ftimeout)
	this.streamController?.abort();
	this.callbacks.emitClose();
  }
}