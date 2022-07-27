export interface QWebChannelConfig<QTObjectsMock extends Record<string, any>> {
	// Add script src to in head
	injectScript?: boolean | "auto";

	// URL of qwebchannel.js
	scriptSrc?: string;

	// Object
	qtObjectsMock?: QTObjectsMock;
}
export interface QWebChannelSignal {
	connect: (callback: (data: any) => void) => void;
	disconnect: (callback: (data: any) => void) => void;
}

export enum QWebChannelMessageTypes {
	signal = 1,
	propertyUpdate = 2,
	init = 3,
	idle = 4,
	debug = 5,
	invokeMethod = 6,
	connectToSignal = 7,
	disconnectFromSignal = 8,
	setProperty = 9,
	response = 10,
}
