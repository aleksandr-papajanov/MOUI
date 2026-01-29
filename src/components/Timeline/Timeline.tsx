import { IProcessStep } from '../../types/IProcessStep';
import React from 'react';
import './Timeline.css';

interface TimelineProps {
    steps: IProcessStep[];
}

export default function Timeline({ steps }: TimelineProps) {
    const hasTimeline = steps.some(s => s.allocatedSlot);

    if (!hasTimeline) {
        return <p className="text-muted">No timeline data available (time window was not specified)</p>;
    }

    const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

    // Calculate timeline boundaries
    const allSlots = sortedSteps.map(s => s.allocatedSlot).filter(Boolean);
    if (allSlots.length === 0) return null;

    const startTimes = allSlots.map(s => new Date(s!.startTime).getTime());
    const endTimes = allSlots.map(s => new Date(s!.endTime).getTime());
    const minTime = Math.min(...startTimes);
    const maxTime = Math.max(...endTimes);
    const totalDuration = maxTime - minTime;

    // Calculate gaps between steps
    const gaps: Array<{ start: number; end: number; duration: number }> = [];
    for (let i = 0; i < sortedSteps.length - 1; i++) {
        const currentStep = sortedSteps[i];
        const nextStep = sortedSteps[i + 1];
        if (currentStep.allocatedSlot && nextStep.allocatedSlot) {
            const currentEnd = new Date(currentStep.allocatedSlot.endTime).getTime();
            const nextStart = new Date(nextStep.allocatedSlot.startTime).getTime();
            if (nextStart > currentEnd) {
                const gapDuration = (nextStart - currentEnd) / (1000 * 60 * 60); // hours
                gaps.push({ start: currentEnd, end: nextStart, duration: gapDuration });
            }
        }
    }

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPosition = (time: number) => {
        return ((time - minTime) / totalDuration) * 100;
    };

    return (
        <div className="timeline">
            <div className="timeline-header">
                <span>{formatDateTime(new Date(minTime))}</span>
                <span>{formatDateTime(new Date(maxTime))}</span>
            </div>

            {/* Combined timeline showing all processes and breaks */}
            <div className="timeline-combined">
                <div className="timeline-label-combined">
                    <strong>Full Schedule</strong>
                    <span>Execution + Breaks</span>
                </div>
                <div className="timeline-track">
                    {sortedSteps.map(step => {
                        if (!step.allocatedSlot) return null;
                        const start = new Date(step.allocatedSlot.startTime).getTime();
                        const end = new Date(step.allocatedSlot.endTime).getTime();
                        const duration = (end - start) / (1000 * 60 * 60);
                        const leftPos = getPosition(start);
                        const width = getPosition(end) - leftPos;

                        return (
                            <div
                                key={step.id}
                                className="timeline-bar timeline-bar-process"
                                style={{
                                    left: `${leftPos}%`,
                                    width: `${width}%`
                                }}
                                title={`Step ${step.stepNumber}: ${step.process}\n${formatDateTime(new Date(start))} - ${formatDateTime(new Date(end))}\n${duration.toFixed(1)}h`}
                            >
                                <span className="timeline-bar-text">{step.stepNumber}</span>
                            </div>
                        );
                    })}
                    {gaps.map((gap, index) => {
                        const leftPos = getPosition(gap.start);
                        const width = getPosition(gap.end) - leftPos;

                        return (
                            <div
                                key={`gap-${index}`}
                                className="timeline-bar timeline-bar-gap"
                                style={{
                                    left: `${leftPos}%`,
                                    width: `${width}%`
                                }}
                                title={`Break: ${gap.duration.toFixed(1)}h\n${formatDateTime(new Date(gap.start))} - ${formatDateTime(new Date(gap.end))}`}
                            >
                                <span className="timeline-bar-text">⏸ {gap.duration.toFixed(1)}h</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Individual steps timeline */}
            <div className="timeline-container">
                {sortedSteps.map((step) => {
                    if (!step.allocatedSlot) return null;

                    const start = new Date(step.allocatedSlot.startTime).getTime();
                    const end = new Date(step.allocatedSlot.endTime).getTime();
                    const duration = (end - start) / (1000 * 60 * 60); // hours

                    return (
                        <div key={step.id} className="timeline-row">
                            <div className="timeline-label">
                                <strong>Step {step.stepNumber}</strong>
                                <span>{step.process}</span>
                                <small>{step.selectedProviderName}</small>
                            </div>
                            <div className="timeline-track">
                                {step.allocatedSlot.segments && step.allocatedSlot.segments.length > 0 ? (
                                    // Show segments (execution + breaks)
                                    step.allocatedSlot.segments.map((segment, segIndex) => {
                                        const segStart = new Date(segment.startTime).getTime();
                                        const segEnd = new Date(segment.endTime).getTime();
                                        const segDuration = (segEnd - segStart) / (1000 * 60 * 60);
                                        const leftPos = getPosition(segStart);
                                        const width = getPosition(segEnd) - leftPos;
                                        const isBreak = segment.segmentType.toLowerCase().includes('break');

                                        return (
                                            <div
                                                key={`${step.id}-seg-${segIndex}`}
                                                className={`timeline-bar ${isBreak ? 'timeline-bar-gap' : 'timeline-bar-process'}`}
                                                style={{
                                                    left: `${leftPos}%`,
                                                    width: `${width}%`
                                                }}
                                                title={`${isBreak ? 'Break' : 'Execution'}: ${formatDateTime(new Date(segStart))} - ${formatDateTime(new Date(segEnd))} (${segDuration.toFixed(1)}h)`}
                                            >
                                                <span className="timeline-bar-text">
                                                    {isBreak ? `⏸ ${segDuration.toFixed(1)}h` : `${segDuration.toFixed(1)}h`}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // Fallback: show single bar for whole slot
                                    <div
                                        className="timeline-bar timeline-bar-process"
                                        style={{
                                            left: `${getPosition(start)}%`,
                                            width: `${getPosition(end) - getPosition(start)}%`
                                        }}
                                        title={`${formatDateTime(new Date(start))} - ${formatDateTime(new Date(end))} (${duration.toFixed(1)}h)`}
                                    >
                                        <span className="timeline-bar-text">{duration.toFixed(1)}h</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
