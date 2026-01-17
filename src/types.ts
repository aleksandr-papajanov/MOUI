export type OptimizationRequestResponse = { commandId: string };

export type OptimizationStatusResponse =
  | { status: "not_found" }
  | { status: "processing" }
  | {
      status: "completed";
      data: { providerId: string; response: string };
    };

export type ProvidersResponse = {
  totalProviders: number;
  providers: Array<{
    providerId: string;
    providerType: string;
    providerName: string;
    registeredAt: string;
  }>;
};

export type MotorRequestDto = {
  requestId: string;
  customerId: string;
  power: string;
  targetEfficiency: string;
};

export type SubmitResponse = { status: string; requestId: string };

export type SelectStrategyDto = {
  requestId: string; // NOTE: your DTO expects Guid in C#, but submit uses string.
  providerId: string;
  strategyName: string;
};
