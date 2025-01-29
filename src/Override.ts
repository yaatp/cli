import { defineStep, supportCodeLibraryBuilder } from '@cucumber/cucumber';

export function Override(pattern: string | RegExp, ...rest: any[]): void {
    // @ts-ignore
    const definitionIndex = supportCodeLibraryBuilder.stepDefinitionConfigs.findIndex(
        (definition: { pattern: string | RegExp }) => definition.pattern === pattern
    );
    // @ts-ignore
    supportCodeLibraryBuilder.stepDefinitionConfigs.splice(definitionIndex, 1);
    // @ts-ignore
    defineStep(pattern, ...rest);
}
