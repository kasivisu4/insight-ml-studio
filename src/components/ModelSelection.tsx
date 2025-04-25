
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export type ModelType = 
  | 'linear_regression'
  | 'decision_tree'
  | 'random_forest'
  | 'xgboost'
  | 'logistic_regression';

export type ModelParams = {
  [key: string]: any;
}

const defaultModelParams = {
  linear_regression: {},
  logistic_regression: {},
  decision_tree: {
    max_depth: 5,
    min_samples_split: 2
  },
  random_forest: {
    n_estimators: 100,
    max_depth: 5,
    min_samples_split: 2
  },
  xgboost: {
    n_estimators: 100,
    learning_rate: 0.1,
    max_depth: 5
  }
};

export type ModelInfo = {
  id: ModelType;
  name: string;
  description: string;
  type: 'regression' | 'classification' | 'both';
  complexity: 'low' | 'medium' | 'high';
  interpretability: 'low' | 'medium' | 'high';
  performance: 'low' | 'medium' | 'high';
}

const models: ModelInfo[] = [
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    description: 'A simple approach for predicting a numerical value. Good for linear relationships.',
    type: 'regression',
    complexity: 'low',
    interpretability: 'high',
    performance: 'low'
  },
  {
    id: 'logistic_regression',
    name: 'Logistic Regression',
    description: 'Simple classification algorithm that works well for linearly separable classes.',
    type: 'classification',
    complexity: 'low',
    interpretability: 'high',
    performance: 'low'
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree',
    description: 'Creates a tree of decisions based on feature values. Highly interpretable.',
    type: 'both',
    complexity: 'medium',
    interpretability: 'high',
    performance: 'medium'
  },
  {
    id: 'random_forest',
    name: 'Random Forest',
    description: 'Ensemble of decision trees. More accurate but less interpretable than a single tree.',
    type: 'both',
    complexity: 'medium',
    interpretability: 'medium',
    performance: 'high'
  },
  {
    id: 'xgboost',
    name: 'XGBoost',
    description: 'Advanced gradient boosting algorithm. Excellent performance but more complex.',
    type: 'both',
    complexity: 'high',
    interpretability: 'low',
    performance: 'high'
  }
];

interface ModelSelectionProps {
  taskType?: 'classification' | 'regression' | null;
  selectedModel: ModelType | null;
  modelParams: ModelParams;
  onModelSelect: (model: ModelType) => void;
  onParamsChange: (params: ModelParams) => void;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({
  taskType,
  selectedModel,
  modelParams,
  onModelSelect,
  onParamsChange
}) => {
  const filteredModels = taskType
    ? models.filter(model => model.type === taskType || model.type === 'both')
    : models;

  const handleParamChange = (param: string, value: any) => {
    if (!selectedModel) return;
    
    const newParams = {
      ...modelParams,
      [param]: value
    };
    
    onParamsChange(newParams);
  };

  const renderParams = () => {
    if (!selectedModel) return null;
    
    const params = modelParams || {};
    
    switch (selectedModel) {
      case 'decision_tree':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_depth">Max Depth: {params.max_depth}</Label>
                </div>
                <Slider
                  id="max_depth"
                  min={1}
                  max={20}
                  step={1}
                  value={[params.max_depth || 5]}
                  onValueChange={(value) => handleParamChange('max_depth', value[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min_samples_split">Min Samples Split: {params.min_samples_split}</Label>
                </div>
                <Slider
                  id="min_samples_split"
                  min={2}
                  max={20}
                  step={1}
                  value={[params.min_samples_split || 2]}
                  onValueChange={(value) => handleParamChange('min_samples_split', value[0])}
                />
              </div>
            </div>
          </>
        );
      case 'random_forest':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="n_estimators">Number of Trees: {params.n_estimators}</Label>
                </div>
                <Slider
                  id="n_estimators"
                  min={10}
                  max={500}
                  step={10}
                  value={[params.n_estimators || 100]}
                  onValueChange={(value) => handleParamChange('n_estimators', value[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_depth">Max Depth: {params.max_depth}</Label>
                </div>
                <Slider
                  id="max_depth"
                  min={1}
                  max={20}
                  step={1}
                  value={[params.max_depth || 5]}
                  onValueChange={(value) => handleParamChange('max_depth', value[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min_samples_split">Min Samples Split: {params.min_samples_split}</Label>
                </div>
                <Slider
                  id="min_samples_split"
                  min={2}
                  max={20}
                  step={1}
                  value={[params.min_samples_split || 2]}
                  onValueChange={(value) => handleParamChange('min_samples_split', value[0])}
                />
              </div>
            </div>
          </>
        );
      case 'xgboost':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="n_estimators">Number of Trees: {params.n_estimators}</Label>
                </div>
                <Slider
                  id="n_estimators"
                  min={10}
                  max={500}
                  step={10}
                  value={[params.n_estimators || 100]}
                  onValueChange={(value) => handleParamChange('n_estimators', value[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="learning_rate">Learning Rate: {params.learning_rate}</Label>
                </div>
                <Slider
                  id="learning_rate"
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  value={[params.learning_rate || 0.1]}
                  onValueChange={(value) => handleParamChange('learning_rate', value[0])}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_depth">Max Depth: {params.max_depth}</Label>
                </div>
                <Slider
                  id="max_depth"
                  min={1}
                  max={20}
                  step={1}
                  value={[params.max_depth || 5]}
                  onValueChange={(value) => handleParamChange('max_depth', value[0])}
                />
              </div>
            </div>
          </>
        );
      default:
        return <p className="text-sm text-gray-500">This model has no configurable parameters.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={selectedModel || ''} 
        onValueChange={(val) => onModelSelect(val as ModelType)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredModels.map((model) => (
          <div key={model.id} className="relative">
            <RadioGroupItem
              value={model.id}
              id={`model-${model.id}`}
              className="sr-only"
            />
            <Label
              htmlFor={`model-${model.id}`}
              className="cursor-pointer"
            >
              <Card className={`h-full transition-all ${
                selectedModel === model.id 
                  ? 'border-2 border-ml-primary shadow-md' 
                  : 'border hover:border-gray-300'
              }`}>
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Complexity</span>
                      <span className={`font-medium ${
                        model.complexity === 'low' 
                          ? 'text-green-600' 
                          : model.complexity === 'medium' 
                            ? 'text-amber-600' 
                            : 'text-red-600'
                      }`}>
                        {model.complexity.charAt(0).toUpperCase() + model.complexity.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Interpretability</span>
                      <span className={`font-medium ${
                        model.interpretability === 'high' 
                          ? 'text-green-600' 
                          : model.interpretability === 'medium' 
                            ? 'text-amber-600' 
                            : 'text-red-600'
                      }`}>
                        {model.interpretability.charAt(0).toUpperCase() + model.interpretability.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Performance</span>
                      <span className={`font-medium ${
                        model.performance === 'high' 
                          ? 'text-green-600' 
                          : model.performance === 'medium' 
                            ? 'text-amber-600' 
                            : 'text-red-600'
                      }`}>
                        {model.performance.charAt(0).toUpperCase() + model.performance.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedModel && (
        <Card>
          <CardHeader>
            <CardTitle>Model Parameters</CardTitle>
            <CardDescription>
              Configure the parameters for {models.find(m => m.id === selectedModel)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="parameters" className="w-full">
              <AccordionItem value="parameters">
                <AccordionTrigger>Parameters</AccordionTrigger>
                <AccordionContent>
                  {renderParams()}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { ModelSelection, models, defaultModelParams };
