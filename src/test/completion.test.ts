import { equal } from 'assert';
import { commands, CompletionItemKind, CompletionList, Position, Uri } from 'vscode';
import { getDocumentUri, openDocument } from './test-helper';

suite('Completion test suite', () => {
    test('Completion test', async () => {
        const uri = getDocumentUri('completion-test.frag');
        await openDocument(uri);
        const realResults = await getRealResults(uri);
        compareCompletions(realResults);
    });
});

async function getRealResults(uri: Uri): Promise<CompletionList> {
    return await commands.executeCommand('vscode.executeCompletionItemProvider', uri, new Position(1, 0));
}

function compareCompletions(realResults: CompletionList): void {
    const realSnippetCount = realResults.items.filter((ci) => ci.kind === CompletionItemKind.Snippet).length;
    const expectedSnippetCount = 31;
    equal(realSnippetCount, expectedSnippetCount);
}
