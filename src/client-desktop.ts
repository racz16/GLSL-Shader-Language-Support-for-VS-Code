import { access, chmod, constants } from 'fs/promises';
import { arch, platform } from 'os';
import { join } from 'path';
import { ExtensionContext, ExtensionMode } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import { EXTENSION_ID, EXTENSION_NAME, ExtensionEnvironment, GLSL, LANGUAGE_SERVER_FOLDER } from './constants';
import { initializeTelemetry, onTelemetry, releaseTelemetry, sendTelemetry } from './telemetry';

let platformName: NodeJS.Platform;
let context: ExtensionContext;
let client: LanguageClient;

let environment: ExtensionEnvironment;

export async function activate(ctx: ExtensionContext): Promise<void> {
    initialize(ctx);
    const serverOptions = await getServerOptions();
    const clientOptions: LanguageClientOptions = {
        documentSelector: [GLSL],
    };
    client = new LanguageClient(EXTENSION_ID, EXTENSION_NAME, serverOptions, clientOptions);
    initializeTelemetry(ctx, environment);
    client.onTelemetry(onTelemetry);
    await client.start();
}

function initialize(ctx: ExtensionContext): void {
    context = ctx;
    platformName = platform();
}

async function getServerOptions(): Promise<ServerOptions> {
    if (context.extensionMode === ExtensionMode.Production && isExecutableAvailable()) {
        const executablePath = getExecutablePath();
        const executable = await makeFileExecutableIfNeeded(executablePath);
        if (executable) {
            environment = 'executable';
            return {
                command: executablePath,
                args: ['--stdio'],
                options: {
                    cwd: getCwd(),
                },
            };
        }
    }
    environment = 'node';
    return getNodeJsServerOptions();
}

function isExecutableAvailable(): boolean {
    return (platformName === 'win32' || platformName === 'linux' || platformName === 'darwin') && arch() === 'x64';
}

function getExecutablePath(): string {
    const fileName = getExecutableFileName();
    return context.asAbsolutePath(join(LANGUAGE_SERVER_FOLDER, 'bin', fileName));
}

function getExecutableFileName(): string {
    switch (platformName) {
        case 'win32':
            return 'server-desktop-win.exe';
        case 'linux':
            return 'server-desktop-linux';
        case 'darwin':
            return 'server-desktop-macos';
        default:
            throw new Error('Unsupported platform');
    }
}

async function makeFileExecutableIfNeeded(file: string): Promise<boolean> {
    if (platformName === 'win32') {
        return true;
    }
    try {
        await access(file, constants.X_OK);
        return true;
    } catch {
        // file is not executable
        try {
            await chmod(file, 0o755);
            return true;
        } catch {
            // can't make file executable
            return false;
        }
    }
}

function getCwd(): string {
    return join(context.extensionPath, LANGUAGE_SERVER_FOLDER, 'res');
}

function getNodeJsServerOptions(): ServerOptions {
    const serverModule = context.asAbsolutePath(join(LANGUAGE_SERVER_FOLDER, 'out', 'server-desktop.js'));
    const cwd = getCwd();
    return {
        run: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: {
                cwd,
            },
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--inspect=6009'],
                cwd,
            },
        },
    };
}

export async function deactivate(): Promise<void> {
    sendTelemetry();
    await releaseTelemetry();
    return client?.stop();
}
