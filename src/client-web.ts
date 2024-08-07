import { ExtensionContext, Uri } from 'vscode';
import { LanguageClient, LanguageClientOptions } from 'vscode-languageclient/browser';

import { EXTENSION_ID, EXTENSION_NAME, GLSL, LANGUAGE_SERVER_FOLDER } from './constants';
import { initializeTelemetry, onTelemetry, releaseTelemetry, sendTelemetry } from './telemetry';

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void> {
    const clientOptions: LanguageClientOptions = {
        documentSelector: [GLSL],
    };
    client = createWorkerLanguageClient(context, clientOptions);
    initializeTelemetry(context, 'browser');
    client.onTelemetry(onTelemetry);
    await client.start();
}

function createWorkerLanguageClient(context: ExtensionContext, clientOptions: LanguageClientOptions): LanguageClient {
    const serverMain = Uri.joinPath(context.extensionUri, LANGUAGE_SERVER_FOLDER, 'out', 'server-web.js');
    const worker = new Worker(serverMain.toString(true));
    return new LanguageClient(EXTENSION_ID, EXTENSION_NAME, clientOptions, worker);
}

export async function deactivate(): Promise<void> {
    sendTelemetry();
    await releaseTelemetry();
    return client?.stop();
}
