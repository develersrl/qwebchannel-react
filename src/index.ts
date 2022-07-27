import * as React from "react";
import { QWebChannelConfig } from "./types";
export * from "./types";

const DEFAULT_CONFIG: Required<QWebChannelConfig<any>> = {
	injectScript: "auto",
	scriptSrc: "qrc:///qtwebchannel/qwebchannel.js",
	qtObjectsMock: {},
};

export function runInLocal() {
	return typeof window.QWebChannel === "undefined" || typeof window.qt === "undefined";
}

/**
 * Return a React hook to use QTObject with QWebChannel
 *
 * @export
 * @template T
 * @param {QWebChannelConfig<QtMockObjects>} config
 * @return {*}
 */
export default function <QtMockObjects>(config: QWebChannelConfig<QtMockObjects>) {
	const { injectScript, scriptSrc, qtObjectsMock }: Required<QWebChannelConfig<QtMockObjects>> = {
		...DEFAULT_CONFIG,
		...config,
	};

	// Check if QT inject 'qt' object into window
	const bRunInLocal = runInLocal();

	let QWebChannelPromise: () => Promise<QtMockObjects> = () => Promise.resolve(qtObjectsMock);

	if (!bRunInLocal) {
		// load webchannel script if not exist
		let bAppendScript = injectScript === true;
		if (injectScript === "auto") {
			bAppendScript = document.querySelector('script[src*="qwebchannel"]') === null;
		}
		const ScriptLoadedPromise = bAppendScript ? appendScript(scriptSrc) : Promise.resolve();

		// Bind qt object
		let globalQTWebChannelObjectsPromise: Promise<QtMockObjects> | null = null;
		const LoadObjectsPromise = () => {
			if (globalQTWebChannelObjectsPromise) {
				return globalQTWebChannelObjectsPromise;
			}

			return (globalQTWebChannelObjectsPromise = new Promise<QtMockObjects>(resolve => {
				new window.QWebChannel(window.qt.webChannelTransport, function (channel) {
					resolve(channel.objects as QtMockObjects);
				});
			}));
		};

		// Override QWebChannelPromise to get qt object after script loaded
		QWebChannelPromise = () => ScriptLoadedPromise.then(LoadObjectsPromise);
	} else {
		/**
		 * The script was not loaded by webview
		 */
		console.warn("QWebChannel not connected");
	}

	/**
	 * This is the hook used in React components.
	 * You can pass the shared object name from qt
	 *
	 * @template QTObjectName
	 * @param {QTObjectName} qtObjectName
	 * @return {*}  {(QTObjects[QTObjectName] | null)}
	 */
	function useQWebChannel<QTObjectName extends keyof QtMockObjects>(
		qtObjectName: QTObjectName
	): QtMockObjects[QTObjectName] | null {
		const [qtObject, setQtObject] = React.useState<QtMockObjects[QTObjectName] | null>(null);

		React.useEffect(() => {
			QWebChannelPromise().then(objects => {
				setQtObject(objects[qtObjectName]);
			});
		}, [qtObjectName]);

		return qtObject;
	}

	return useQWebChannel;
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Return a promise when script loaded
 *
 * @param {string} src
 * @return {*}
 */
function appendScript(src: string) {
	return new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.onload = () => {
			resolve();
		};
		script.onerror = () => {
			console.warn("Failed to load script", src);
			reject();
		};

		script.src = src;

		document.head.appendChild(script);
	});
}
