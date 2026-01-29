import { ReactElement, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOptimizationRequest } from '../../types/IOptimizationRequest';
import { useRequestOptimizationPlan } from '../../hooks/api/optimizationApi';
import { usePollingApi } from '../../hooks/api/usePollingApi';
import { IOptimizationPlan } from '../../types/IOptimizationPlan';
import { useSelectStrategy, useGetOptimizationPlan } from '../../hooks/api/optimizationApi';
import OptimizationRequestForm from '../../components/OptimizationRequestForm/OptimizationRequestForm';
import OptimizationPollingStatus from '../../components/OptimizationPollingStatus/OptimizationPollingStatus';
import StrategySelector from '../../components/StrategySelector/StrategySelector';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import Loading from '../../components/loading/Loading';
import { generateRandomRequest } from '../../utils/requestGenerator';
import './RequestOptimizationPage.css';

// Constants
const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 600000; // 10 minutes

type Step = 'form' | 'polling' | 'strategies';

const RequestOptimizationPage = (): ReactElement => {
    const navigate = useNavigate();
    
    // State
    const [step, setStep] = useState<Step>('form');
    const [requestId, setRequestId] = useState<string>('');
    const [plan, setPlan] = useState<IOptimizationPlan | null>(null);
    const [request] = useState<IOptimizationRequest>(() => generateRandomRequest());
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // API Hooks
    const { callApi: submitRequest, loading: submitting, error: submitError } = useRequestOptimizationPlan();
    const { callApi: selectStrategy, loading: selecting, error: selectError } = useSelectStrategy();
    const { callApi: getPlan } = useGetOptimizationPlan();
    
    const shouldStartPolling = step === 'polling' || isSelecting;
    
    const shouldStopPolling = (data: IOptimizationPlan): boolean => {
        const hasStrategies = data.status === 'AwaitingStrategySelection' && data.strategies?.length > 0;
        const hasFailed = data.status === 'Failed';
        const isConfirmed = data.status === 'Confirmed';
        
        return hasStrategies || hasFailed || isConfirmed;
    };

    const { 
        data: pollingData, 
        loading: polling, 
        error: pollingError, 
        elapsed, 
        isTimeout,
        stop: stopPolling
    } = usePollingApi<IOptimizationPlan>(
        { url: `/api/optimization-requests/${requestId}/plan` },
        { 
            interval: POLLING_INTERVAL, 
            timeout: POLLING_TIMEOUT, 
            immediate: shouldStartPolling,
            stopCondition: shouldStopPolling
        }
    );

    // Handlers
    const handleSubmit = async (): Promise<void> => {
        try {
            const id = await submitRequest(request);
            setRequestId(id);
            setStep('polling');
        } catch (err) {
            console.error('Failed to submit optimization request:', err);
        }
    };

    const handleSelectStrategy = async (index: number): Promise<void> => {
        if (!plan?.strategies) return;
        
        setSelectedIndex(index);
        const selectedStrategy = plan.strategies[index];
        
        try {
            await selectStrategy(requestId, selectedStrategy.id);
            
            // Immediately fetch the updated plan
            const updatedPlan = await getPlan(requestId);
            
            // pdate local state with fresh data
            if (updatedPlan) {
                setPlan(updatedPlan);
                
                // If already confirmed, navigate immediately
                if (updatedPlan.status === 'Confirmed' && updatedPlan.selectedStrategy) {
                    navigate(`/plan/${requestId}`);
                } else {
                    // Otherwise start polling for confirmation
                    setIsSelecting(true);
                }
            }
        } catch (err) {
            console.error('Failed to select strategy:', err);
        }
    };

    // Effects
    useEffect(() => {
        if (step !== 'polling' || !pollingData) return;

        const hasStrategies = pollingData.status === 'AwaitingStrategySelection' && pollingData.strategies?.length;
        const hasFailed = pollingData.status === 'Failed';

        if (hasStrategies) {
            setPlan(pollingData);
            setStep('strategies');
            stopPolling();
        } else if (hasFailed) {
            setPlan(pollingData);
            stopPolling();
        }
    }, [step, pollingData, stopPolling]);

    useEffect(() => {
        if (!isSelecting || !pollingData) return;

        // Wait for Confirmed status with selected strategy
        if (pollingData.status === 'Confirmed' && pollingData.selectedStrategy) {
            setPlan(pollingData);
            setIsSelecting(false);
            stopPolling();
            navigate(`/plan/${requestId}`);
        }
    }, [isSelecting, pollingData, stopPolling, navigate, requestId]);
    // Render helpers
    const renderFormStep = () => (
        <>
            <h1>Submit Optimization Request</h1>
            <OptimizationRequestForm request={request} />
            
            {submitError && (
                <Alert variant="error" title={submitError.title || 'Error'}>
                    {submitError.detail && <p>{submitError.detail}</p>}
                    {submitError.status && <p>Status code: {submitError.status}</p>}
                </Alert>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Button onClick={handleSubmit} loading={submitting}>
                    Submit Request
                </Button>
            </div>
        </>
    );

    const renderPollingStep = () => (
        <>
            <h1>Waiting for Plan</h1>
            <OptimizationPollingStatus 
                requestId={requestId}
                status={pollingData?.status}
                elapsed={elapsed}
                loading={polling}
                error={pollingError}
                isTimeout={isTimeout}
                errorMessage={pollingData?.errorMessage}
            />
        </>
    );

    const renderStrategiesStep = () => {
        if (!plan?.strategies) return null;

        return (
            <>
                <h1>Available Optimization Strategies</h1>
                
                {isSelecting ? (
                    <>
                        <h2>Waiting for optimization plan...</h2>
                        {polling && <Loading message="Generating plan..." />}
                    </>
                ) : (
                    <>
                        <StrategySelector 
                            strategies={plan.strategies}
                            onSelect={handleSelectStrategy}
                            selecting={selecting}
                            selectedIndex={selectedIndex}
                        />
                        
                        {selectError && (
                            <Alert variant="error" title={selectError.title || 'Error'}>
                                {selectError.detail && <p>{selectError.detail}</p>}
                                {selectError.status && <p>Status code: {selectError.status}</p>}
                            </Alert>
                        )}
                    </>
                )}
            </>
        );
    };

    return (
        <div className='optimization-request-view'>
            {step === 'form' && renderFormStep()}
            {step === 'polling' && renderPollingStep()}
            {step === 'strategies' && renderStrategiesStep()}
        </div>
    );
};

export default RequestOptimizationPage;