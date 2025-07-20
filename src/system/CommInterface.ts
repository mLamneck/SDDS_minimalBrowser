export type CommCallbacks = {
  onopen?: () => void;
  onmessage?: (data: string) => void;
  onreconnect?: (attempt: number) => void;
  onclose?: () => void;
  onerror?: (err: any) => void;
};

export class CommCallbackManager {
  private listeners: CommCallbacks[] = [];

  subscribe(cb: CommCallbacks) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== cb);
    };
  }

  emitOpen() {
    this.listeners.forEach(cb => cb.onopen?.());
  }

  emitMessage(data: string) {
    this.listeners.forEach(cb => cb.onmessage?.(data));
  }

  emitReconnect(attempt: number) {
    this.listeners.forEach(cb => cb.onreconnect?.(attempt));
  }

  emitClose() {
    this.listeners.forEach(cb => cb.onclose?.());
  }

  emitError(err: any) {
    this.listeners.forEach(cb => cb.onerror?.(err));
  }

  clear() {
    this.listeners = [];
  }
}

export interface IComm {
  send(msg: string): Promise<void>;
  close() : void;
  callbacks: CommCallbackManager;
}