
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
import MultiModelSelection from '@/components/MultiModelSelection';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([]);
  const [modelResults, setModelResults] = useState<Record<ModelType, any>>({});
  // Initialize model params as an empty Record<ModelType, any> object
  const [multiModelParams, setMultiModelParams] = useState<Record<ModelType, any>>({});

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

  // Update model selection handler
  const handleModelsSelect = useCallback((models: ModelType[]) => {
    setSelectedModels(models);
    // Initialize params for each selected model
    const initialParams: Record<ModelType, any> = {};
    models.forEach(model => {
      initialParams[model] = defaultModelParams[model] || {};
    });
    setMultiModelParams(initialParams);
  }, []);

  // Handle training completion for multiple models
  const handleTrainingCompleteMulti = useCallback((modelInfo: any, modelType: ModelType) => {
    setModelResults(prev => ({
      ...prev,
      [modelType]: modelInfo
    }));
    
    // Update trained model state
    setTrainedModel(prev => ({
      ...prev,
      [modelType]: {
        type: modelType,
        params: multiModelParams[modelType]
      }
    }));
    
    // Check if all models have completed training
    const completedModels = Object.keys(modelResults).length + 1; // +1 for the one we just added
    if (completedModels === selectedModels.length) {
      // Move to evaluate step
      setCurrentStep('evaluate');
    }
  }, [selectedModels.length, multiModelParams, modelResults]);

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
                        <Button
                          onClick={() => navigateToStep('select')}
                          className="bg-ml-primary hover:bg-ml-primary/90 text-white flex items-center gap-2"
                        >
                          Next: Select Features
                          <ChevronRight className="h-4 w-4" />
                        </Button>
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
                      <Button
                        onClick={() => navigateToStep('train')}
                        className="bg-ml-primary hover:bg-ml-primary/90 text-white flex items-center gap-2"
                        disabled={selectedFeatures.length === 0 || !selectedTarget}
                      >
                        Next: Train Model
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {currentStep === 'train' && taskType && (
            <div className="space-y-8">
              <MultiModelSelection
                taskType={taskType}
                selectedModels={selectedModels}
                onModelsSelect={handleModelsSelect}
              />
              
              {selectedModels.length > 0 && (
                <div className="grid gap-8">
                  {selectedModels.map(modelType => (
                    <Card key={modelType}>
                      <CardHeader>
                        <CardTitle>{modelType === 'linear_regression' ? 'Linear Regression' : 
                                  modelType === 'logistic_regression' ? 'Logistic Regression' :
                                  modelType === 'decision_tree' ? 'Decision Tree' :
                                  modelType === 'random_forest' ? 'Random Forest' :
                                  'XGBoost'} Training</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ModelTraining
                          featureNames={selectedFeatures}
                          targetName={selectedTarget}
                          taskType={taskType}
                          modelType={modelType}
                          modelParams={multiModelParams[modelType]}
                          onTrainingComplete={(info) => handleTrainingCompleteMulti(info, modelType)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedModels.length === 0 && (
                <div className="flex justify-center p-8 text-center">
                  <div className="max-w-md">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Select Models to Train</h3>
                    <p className="text-gray-500">Select one or more models from the list above to begin training</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'evaluate' && trainedModel && taskType && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Model Comparison</CardTitle>
                  <CardDescription>
                    Compare the performance of your trained models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(modelResults).map(([modelType, results]) => (
                      <Card key={modelType} className="border-2 hover:border-ml-primary transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{modelType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-1">
                            {taskType === 'classification' ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Accuracy:</span>
                                  <span className="font-medium">{results.metrics?.accuracy.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">F1 Score:</span>
                                  <span className="font-medium">{results.metrics?.f1Score.toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">R² Score:</span>
                                  <span className="font-medium">{results.metrics?.r2Score.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">MAE:</span>
                                  <span className="font-medium">{results.metrics?.mae.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
              
              {Object.entries(modelResults).map(([modelType, results]) => (
                <Card key={modelType}>
                  <CardHeader>
                    <CardTitle>Model Evaluation - {modelType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModelResults
                      modelType={modelType as ModelType}
                      taskType={taskType}
                      metrics={results.metrics}
                      featureImportance={results.featureImportance}
                      predictions={results.predictions}
                    />
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => navigateToStep('predict')}
                  className="bg-ml-primary hover:bg-ml-primary/90 text-white flex items-center gap-2"
                >
                  Next: Make Predictions
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 'predict' && trainedModel && taskType && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Make Predictions</CardTitle>
                  <CardDescription>
                    Upload new data and get predictions from your trained models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictData 
                    modelType={Object.keys(modelResults)[0] as ModelType}
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
