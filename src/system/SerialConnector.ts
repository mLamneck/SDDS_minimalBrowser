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

/*
class CustomTransformStream {
    private transformStream: TransformStream<Uint8Array, Uint8Array>;

    constructor(highWaterMark: number) {
        this.transformStream = new TransformStream<Uint8Array, Uint8Array>(
            {
                transform(chunk, controller) {
                    //console.log("data in TransformStream:", chunk);
                    controller.enqueue(chunk);
                }
            },
            // WritableStream Optionen
            { highWaterMark },
            // ReadableStream Optionen
            { highWaterMark }
        );
    }

    get stream() {
        return this.transformStream;
    }
}
*/
/*
const customStream = new CustomTransformStream(64 * 1024).stream;
const readableStream = this.port.readable
	?.pipeThrough(customStream)
	?.pipeThrough(new TextDecoderStream());
this.readableStreamClosePromise = readableStream;
this.reader = readableStream?.getReader();
*/

export class SerialConnector {
    private port?: SerialPort;
    private reader?: ReadableStreamDefaultReader<string>;
    private writer?: WritableStreamDefaultWriter<string>;

    constructor(
        private onOpen: () => void,
        private onMessage: (data: string) => void,
        private onReconnecting: () => void,
        private onClose: () => void,
        private onError: (error: Error) => void
    ) {}

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

            await this.port?.open({ baudRate: 115200, bufferSize:16777216 });

			await this.initRead();
            this.readLoop();
            this.onOpen();
			return true;
        } catch (error) {
            this.onError(error as Error);
        }
		return false
    }

	private buffer : string = "";
	private closeReq = false;
	
	private async readLoop() {
		while (!this.closeReq)
		{
			try {
				while (this.reader && !this.closeReq) {
					const { value, done } = await this.reader.read();
					console.log(value)
					if (done || this.closeReq) {
						this.reader.releaseLock();
						return;
					}
					if (value) {
						this.buffer += value;
						const lines = this.buffer.split('\n');
						this.buffer = lines.pop() || '';
						lines.forEach(line => this.onMessage(line.trim()));
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

            this.onClose();
        } catch (error) {
            this.onError(error as Error);
        }
    }
	
    async send(msg: string) {
		if (!this.port) return;
		try {
            console.log(`Sending: "${msg}"`);
            await this.writer?.write(`${msg}\n`);
        } catch (error) {
            this.onError(error as Error);
        }
    }
}

export default SerialConnector