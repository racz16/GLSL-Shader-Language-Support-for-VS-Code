import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    files: 'out/**/*.test.js',
    workspaceFolder: './test-fixture',
    mocha: {
        timeout: 100000,
    },
});
