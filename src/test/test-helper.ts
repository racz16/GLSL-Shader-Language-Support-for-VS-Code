import { resolve } from 'path';
import { Uri, window, workspace } from 'vscode';

export function getDocumentUri(filePath: string): Uri {
    const path = resolve(__dirname, '../test-fixture', filePath);
    return Uri.file(path);
}

export async function openDocument(uri: Uri): Promise<void> {
    const document = await workspace.openTextDocument(uri);
    await window.showTextDocument(document);
    await sleep(1000);
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
