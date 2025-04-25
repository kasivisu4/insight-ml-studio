
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Stepper, { Step } from '@/components/Stepper';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelSelection, ModelType, defaultModelParams } from '@/components/ModelSelection';
import ModelTraining from '@/components/ModelTraining';
import ModelResults from '@/components/ModelResults';
import PredictData from '@/components/PredictData';
import { parseCSV, determineTaskType, generateMockClassificationMetrics, generateMockRegressionMetrics, generateMockPredictions } from '@/lib/utils';

type WorkflowStep = 'upload' | 'select' | 'train' | 'evaluate' | 'predict';

const Index = () => {
  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  
  // Data state
  const [data, setData] = useState<any[] | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [taskType, setTaskType] = useState<'classification' | 'regression' | null>(null);
  
  // Model state
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [modelParams, setModelParams] = useState<any>({});
  const [trainedModel, setTrainedModel] = useState<any>(null);
  
  // Results state
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  // Steps configuration
  const steps: Step[] = [
    { id: 'upload', name: 'Upload', completed: !!data, current: currentStep === 'upload' },
    { id: 'select', name: 'Select', completed: selectedFeatures.length > 0 && !!selectedTarget, current: currentStep === 'select' },
    { id: 'train', name: 'Train', completed: !!trainedModel, current: currentStep === 'train' },
    { id: 'evaluate', name: 'Evaluate', completed: !!modelMetrics, current: currentStep === 'evaluate' },
    { id: 'predict', name: 'Predict', completed: false, current: currentStep === 'predict' },
  ];

  // Handle workflow navigation
  const navigateToStep = useCallback((step: WorkflowStep) => {
    if (step === 'upload' || 
        (step === 'select' && data) ||
        (step === 'train' && selectedFeatures.length > 0 && selectedTarget) ||
        (step === 'evaluate' && trainedModel) ||
        (step === 'predict' && trainedModel)) {
      setCurrentStep(step);
    }
  }, [data, selectedFeatures, selectedTarget, trainedModel]);

  // Handle dataset upload
  const handleFileUploaded = useCallback((file: File, content: string | ArrayBuffer) => {
    if (typeof content === 'string') {
      const parsedData = parseCSV(content);
      setData(parsedData);
      
      // Reset feature/target selection
      setSelectedFeatures([]);
      setSelectedTarget('');
      setTaskType(null);
    }
  }, []);

  // Handle features and target selection
  const handleFeaturesSelected = useCallback((features: string[]) => {
    setSelectedFeatures(features);
  }, []);

  const handleTargetSelected = useCallback((target: string) => {
    setSelectedTarget(target);
    
    if (target && data) {
      const detectedTaskType = determineTaskType(target, data);
      setTaskType(detectedTaskType);
    }
  }, [data]);

  // Handle model selection
  const handleModelSelect = useCallback((model: ModelType) => {
    setSelectedModel(model);
    setModelParams(defaultModelParams[model] || {});
  }, []);

  // Handle model parameter changes
  const handleParamsChange = useCallback((params: any) => {
    setModelParams(params);
  }, []);

  // Handle training completion
  const handleTrainingComplete = useCallback((modelInfo: any) => {
    setTrainedModel({
      type: selectedModel,
      params: modelParams
    });
    
    setFeatureImportance(modelInfo.featureImportance);
    
    // Generate mock metrics based on task type
    if (taskType === 'classification') {
      setModelMetrics(generateMockClassificationMetrics());
    } else {
      setModelMetrics(generateMockRegressionMetrics());
    }
    
    setPredictions(generateMockPredictions(50, taskType || 'classification'));
    
    // Move to evaluate step
    setCurrentStep('evaluate');
  }, [selectedModel, modelParams, taskType]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Stepper steps={steps} onStepClick={(stepId) => navigateToStep(stepId as WorkflowStep)} />
        
        <div className="my-8">
          {currentStep === 'upload' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Dataset</CardTitle>
                  <CardDescription>
                    Upload your CSV or Excel file containing the dataset you want to use for machine learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!data ? (
                    <FileUpload onFileUploaded={handleFileUploaded} />
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Dataset uploaded successfully</p>
                        <p className="text-sm text-gray-500">
                          {data.length} rows and {Object.keys(data[0]).length} columns
                        </p>
                      </div>
                      <button
                        onClick={() => setData(null)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Upload a different file
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {data && (
                <div className="mt-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Dataset Preview</CardTitle>
                      <CardDescription>
                        Preview of the uploaded data. Click Next to continue to feature selection.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataTable data={data.slice(0, 50)} />
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => navigateToStep('select')}
                          className="px-4 py-2 bg-ml-primary text-white rounded-md hover:bg-ml-primary/90 transition-colors"
                        >
                          Next: Select Features
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'select' && data && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select Features & Target</CardTitle>
                  <CardDescription>
                    Choose the columns to use for training. Select features (inputs) and one target (output) variable.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium">Selected Features ({selectedFeatures.length})</h3>
                      {selectedFeatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedFeatures.map(feature => (
                            <span key={feature} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No features selected yet</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium">Selected Target</h3>
                      {selectedTarget ? (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full inline-block">
                          {selectedTarget}
                        </span>
                      ) : (
                        <p className="text-sm text-gray-500">No target selected yet</p>
                      )}
                    </div>
                    
                    {taskType && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium">Detected task type:</p>
                        <p className="text-sm capitalize text-ml-primary font-medium">
                          {taskType}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <DataTable 
                        data={data.slice(0, 50)} 
                        selectable={true}
                        selectedFeatures={selectedFeatures}
                        selectedTarget={selectedTarget}
                        onSelectFeatures={handleFeaturesSelected}
                        onSelectTarget={handleTargetSelected}
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => navigateToStep('train')}
                        className="px-4 py-2 bg-ml-primary text-white rounded-md hover:bg-ml-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={selectedFeatures.length === 0 || !selectedTarget}
                      >
                        Next: Train Model
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {currentStep === 'train' && taskType && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select Model</CardTitle>
                  <CardDescription>
                    Choose the type of model to train on your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelSelection 
                    taskType={taskType} 
                    selectedModel={selectedModel}
                    modelParams={modelParams}
                    onModelSelect={handleModelSelect}
                    onParamsChange={handleParamsChange}
                  />
                  
                  {selectedModel && (
                    <div className="mt-8">
                      <ModelTraining 
                        featureNames={selectedFeatures}
                        targetName={selectedTarget}
                        taskType={taskType}
                        modelType={selectedModel}
                        modelParams={modelParams}
                        onTrainingComplete={handleTrainingComplete}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {currentStep === 'evaluate' && trainedModel && taskType && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Model Evaluation</CardTitle>
                  <CardDescription>
                    Review the performance of your trained model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelResults 
                    modelType={trainedModel.type}
                    taskType={taskType}
                    metrics={modelMetrics}
                    featureImportance={featureImportance}
                    predictions={predictions}
                  />
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => navigateToStep('predict')}
                      className="px-4 py-2 bg-ml-primary text-white rounded-md hover:bg-ml-primary/90 transition-colors"
                    >
                      Next: Make Predictions
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {currentStep === 'predict' && trainedModel && taskType && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Make Predictions</CardTitle>
                  <CardDescription>
                    Upload new data and get predictions from your trained model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictData 
                    modelType={trainedModel.type}
                    taskType={taskType}
                    featureNames={selectedFeatures}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          InsightML Studio • Build and understand machine learning models
        </div>
      </footer>
    </div>
  );
};

export default Index;
