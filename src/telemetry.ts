import TelemetryReporter, { TelemetryEventMeasurements, TelemetryEventProperties } from '@vscode/extension-telemetry';
import { ExtensionContext, ExtensionMode } from 'vscode';

import { APPLICATION_INSIGHTS_CONNECTION_STRING, ExtensionEnvironment } from './constants';

interface TelemetryResult {
    type: TelemetryResultType;
    stringData: TelemetryEventProperties;
    numberData: TelemetryEventMeasurements;
}

type TelemetryResultType = 'report' | 'error';

let reporter: TelemetryReporter | null = null;
let environment: ExtensionEnvironment;
let result: TelemetryResult | null = null;

export function initializeTelemetry(ec: ExtensionContext, ee: ExtensionEnvironment): void {
    environment = ee;
    if (ec.extensionMode === ExtensionMode.Production) {
        reporter = new TelemetryReporter(APPLICATION_INSIGHTS_CONNECTION_STRING);
    }
}

export function onTelemetry(e: TelemetryResult): void {
    result = e;
}

export function sendTelemetry(): void {
    if (result === null) {
        return;
    }
    if (reporter) {
        sendProductionTelemetry(result, reporter);
    } else {
        sendDebugTelemetry(result);
    }
}

function sendProductionTelemetry(result: TelemetryResult, reporter: TelemetryReporter): void {
    if (result.type === 'report') {
        reporter.sendTelemetryEvent(result.type, { ...result.stringData, environment }, result.numberData);
    } else {
        reporter.sendTelemetryErrorEvent(result.type, { ...result.stringData, environment }, result.numberData);
    }
}

function sendDebugTelemetry(result: TelemetryResult): void {
    console.log('telemetry');
    console.log(`  type: ${result.type}`);
    console.log(`  environment: ${environment}`);
    for (const property in result.stringData) {
        console.log(`  ${property}: '${result.stringData[property]}'`);
    }
    for (const property in result.numberData) {
        console.log(`  ${property}: ${result.numberData[property]}`);
    }
}

export async function releaseTelemetry(): Promise<void> {
    await reporter?.dispose();
}
