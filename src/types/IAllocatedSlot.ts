import { ITimeSegment } from './ITimeSegment';

export interface IAllocatedSlot {
    startTime: string;
    endTime: string;
    segments: ITimeSegment[];
}
