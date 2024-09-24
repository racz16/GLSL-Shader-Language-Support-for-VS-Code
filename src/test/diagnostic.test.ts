import { equal, ok } from 'assert';
import { Diagnostic, DiagnosticSeverity, languages, Position, Range } from 'vscode';

import { getDocumentUri, openDocument } from './test-helper';

suite('Diagnostic test suite', () => {
    test('Diagnostic test', async () => {
        const uri = getDocumentUri('diagnostic-test.frag');
        await openDocument(uri, 2000);
        const realResults = languages.getDiagnostics(uri);
        const expectedResults = getExpectedResults();
        compareDiagnostics(realResults, expectedResults);
    });
});

function getExpectedResults(): Diagnostic[] {
    return [
        {
            message: "'line continuation' : used at end of comment; the following line is still part of the comment",
            severity: DiagnosticSeverity.Warning,
            range: new Range(new Position(2, 0), new Position(2, 52)),
            source: 'glslang',
        },
        {
            message: 'syntax error, unexpected RIGHT_BRACE, expecting COMMA or SEMICOLON',
            severity: DiagnosticSeverity.Error,
            range: new Range(new Position(9, 0), new Position(9, 1)),
            source: 'glslang',
        },
    ];
}

function compareDiagnostics(realResults: Diagnostic[], expectedResults: Diagnostic[]): void {
    equal(realResults.length, expectedResults.length);
    for (let i = 0; i < expectedResults.length; i++) {
        const realResult = realResults[i];
        const expectedResult = expectedResults[i];
        if (!realResult || !expectedResult) {
            throw new Error('Diagostic is falsy');
        }
        compareDiagnostic(realResult, expectedResult);
    }
}

function compareDiagnostic(realResult: Diagnostic, expectedResult: Diagnostic): void {
    equal(realResult.message, expectedResult.message);
    equal(realResult.severity, expectedResult.severity);
    ok(realResult.range.isEqual(expectedResult.range));
    equal(realResult.source, expectedResult.source);
    equal(realResult.relatedInformation, expectedResult.relatedInformation);
    equal(realResult.code, expectedResult.code);
    equal(realResult.tags, expectedResult.tags);
}
