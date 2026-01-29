export type Provider = {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  processCapabilities?: Array<{
    id: string;
    process: string;
    costPerHour: number;
    energyConsumptionKwhPerHour: number;
    carbonIntensityKgCO2PerKwh: number;
    qualityScore: number;
    speedMultiplier: number;
    usesRenewableEnergy: boolean;
  }>;
  technicalCapabilities?: {
    id: string;
    power: number;
    axisHeight: number;
    tolerance: number;
  };
};

export type OptimizationRequestDto = {
  customerId: string;
  motorSpecs: {
    powerKW: number;
    axisHeightMM: number;
    currentEfficiency: string; // "IE1" | "IE2" | ...
    targetEfficiency: string; // "IE1" | "IE2" | ...
    malfunctionDescription?: string;
  };
  constraints?: {
    maxBudget?: number;
    requiredDeadline?: string | null; // ISO or null
  };
  createdAt?: string | null;
};

export type OptimizationRequestResponse = {
  requestId?: string;
  commandId?: string;
};

export type Strategy = {
  id: string;
  planId: string;
  requestId: string;
  strategyName: string;
  priority: string;
  workflowType: string;
};

export type Plan = {
  planId: string;
  requestId: string;
  selectedStrategy: any;
  steps: Array<{
    id: string;
    stepNumber: number;
    process: string;
    selectedProviderId: string;
    selectedProviderName: string;
    estimate: {
      id: string;
      cost: number;
      duration: string;
      qualityScore: number;
      emissionsKgCO2: number;
    };
  }>;
};
