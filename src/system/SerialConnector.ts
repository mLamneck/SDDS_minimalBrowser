import {IComm, CommCallbackManager } from "./CommInterface"

declare global {
	interface Navigator {
		serial: Serial;
	}
}

interface SerialPort extends EventTarget {
	open(options: SerialOptions): Promise<void>;
	close(): Promise<void>;
	readable: ReadableStream<Uint8Array> | null;
	writable: WritableStream<Uint8Array> | null;
}

interface SerialOptions {
	baudRate: number;
	dataBits?: number;
	stopBits?: number;
	parity?: "none" | "even" | "odd";
	bufferSize?: number;
	flowControl?: "none" | "hardware";
}

interface Serial {
	requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
	getPorts(): Promise<SerialPort[]>;
}

interface SerialPortRequestOptions {
	filters?: SerialPortFilter[];
}

interface SerialPortFilter {
	usbVendorId?: number;
	usbProductId?: number;
}

export class SerialConnector implements IComm {
	private port?: SerialPort;
	private reader?: ReadableStreamDefaultReader<string>;
	private writer?: WritableStreamDefaultWriter<string>;
	public callbacks = new CommCallbackManager();

	private readableStreamClosePromise : any;
	private writeableStreamClosePromise : any;

	private async initRead(){
		if (!this.port?.readable) {
			throw new Error("Serial port is not readable");
		}

		const textDecoder = new TextDecoderStream();
		this.readableStreamClosePromise = this.port.readable.pipeTo(textDecoder.writable);
		this.reader = textDecoder.readable.getReader();

		const encoder = new TextEncoderStream();
		this.writeableStreamClosePromise = encoder.readable.pipeTo(this.port.writable!);
		this.writer = encoder.writable.getWriter();
		
		this.closeReq = false;
	}

	async connect() {
		if (this.port) return true;
		try {
			this.port = await navigator.serial.requestPort();
			console.log(this.port)

			await this.port?.open({ baudRate: 115200, bufferSize:16777216 });

			await this.initRead();
			this.readLoop();
			this.callbacks.emitOpen();
			return true;
		} catch (error) {
			const errorMessage =
			error instanceof Error
				? error.message
				: typeof error === 'string'
				? error
				: JSON.stringify(error);
			this.port = undefined
			this.callbacks.emitError(errorMessage);
			throw errorMessage;		
		}
	}

	private buffer : string = "";
	private closeReq = false;
	
	private async readLoop() {
		while (!this.closeReq)
		{
			try {
				while (this.reader && !this.closeReq) {
					const { value, done } = await this.reader.read();

					if (done || this.closeReq) {
						this.buffer = "";
						this.reader.releaseLock();
						return;
					}

					if (value) {
						this.buffer += value;
						let lines = this.buffer.split("\n");
						this.buffer = lines.pop() ?? "";

						for (const line of lines) {
							if (line.trim().length > 0) {
								this.callbacks.emitMessage(line.trim());
							}
						}
					}
				}
			} catch (error) {
				try{
					await this.reader?.cancel();
				} catch(error){
					console.log(error)
				}
				await this.readableStreamClosePromise.catch(()=>{console.log("catch error")})
	
				if (this.writer != undefined)
				{
					await this.writer?.close();
					await this.writeableStreamClosePromise;	
				}
				this.initRead();
			}
		}
	}

	async send(msg: string): Promise<void> {
		if (!this.port || !this.writer) return Promise.resolve();
		return this.writer.write(`${msg}\n`);
	}

	async close() {
		if (!this.port) return;
		try {
			this.closeReq = true;
			this.reader?.cancel();
			await this.readableStreamClosePromise.catch(()=>{console.log("catch error")})

			if (this.writer != undefined)
			{
				await this.writer?.close();
				await this.writeableStreamClosePromise;	
			}

			await this.port?.close();
			
			this.reader = undefined;
			this.writer = undefined;
			this.port = undefined;
			this.readableStreamClosePromise = undefined;
			this.writeableStreamClosePromise = undefined;

			this.callbacks.emitClose();
		} catch (error) {
			this.callbacks.emitError(error);
		}

		this.callbacks.emitClose();
	}
	
}