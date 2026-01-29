import { IProcessEstimate } from './IProcessEstimate';
import { IAllocatedSlot } from './IAllocatedSlot';

export interface IProcessStep {
    id: string;
    stepNumber: number;
    process: string;
    selectedProviderId: string;
    selectedProviderName: string;
    estimate: IProcessEstimate;
    allocatedSlot?: IAllocatedSlot;
}
