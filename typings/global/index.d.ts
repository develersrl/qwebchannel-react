import { QWebChannelMessageTypes } from "../../src";

export class QWebChannel {
  constructor(
    transport: WebSocket,
    initCallback: (channel: QWebChannel) => void
  );

  objects: any;

  send(data: any): void;
  exec(data: any, callback: (data: any) => void): void;
  handleSignal(message: MessageEvent): void;
  handleResponse(message: MessageEvent): void;
  handlePropertyUpdate(message: MessageEvent): void;
}

declare global {
  interface Window {
    QWebChannelMessageTypes: QWebChannelMessageTypes;

    qt: {
      webChannelTransport: any;
    };

    QWebChannel: typeof QWebChannel;
  }
}
