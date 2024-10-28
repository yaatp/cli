import { DataTable, IWorld } from '@cucumber/cucumber';

export interface Validation {
    (AR: any, ER: any): void;
    type: string;
    poll: (AR: any, ER: any, options?: {timeout?: number, interval?: number}) => Promise<unknown>
}

export interface IQavajsWorld extends IWorld {
    getValue(expression: string): Promise<any>;
    setValue(key: string, value: any): void;
    executeStep(step: string, extraParam?: DataTable | string): Promise<void>;
    validation(type: string): Validation;
    config: any;
}
