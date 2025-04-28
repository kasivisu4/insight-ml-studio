
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ModelType, ModelParams, defaultModelParams } from './ModelSelection';
import { Badge } from '@/components/ui/badge';

type MultiModelSelectionProps = {
  taskType: 'classification' | 'regression';
  selectedModels: ModelType[];
  onModelsSelect: (models: ModelType[]) => void;
};

const MultiModelSelection: React.FC<MultiModelSelectionProps> = ({
  taskType,
  selectedModels,
  onModelsSelect,
}) => {
  const availableModels: { type: ModelType; label: string; description: string }[] = taskType === 'classification' 
    ? [
        { 
          type: 'logistic_regression', 
          label: 'Logistic Regression',
          description: 'Simple linear model for classification tasks. Fast to train with high interpretability.'
        },
        { 
          type: 'decision_tree', 
          label: 'Decision Tree',
          description: 'Tree-based model that splits data based on feature values. Highly interpretable.'
        },
        { 
          type: 'random_forest', 
          label: 'Random Forest',
          description: 'Ensemble of decision trees. More accurate but less interpretable than a single tree.'
        },
        { 
          type: 'xgboost', 
          label: 'XGBoost',
          description: 'Advanced gradient boosting algorithm. Excellent performance on many tasks.'
        },
      ]
    : [
        { 
          type: 'linear_regression', 
          label: 'Linear Regression',
          description: 'Simple linear model for regression tasks. Fast to train with high interpretability.'
        },
        { 
          type: 'decision_tree', 
          label: 'Decision Tree',
          description: 'Tree-based model that splits data based on feature values. Highly interpretable.'
        },
        { 
          type: 'random_forest', 
          label: 'Random Forest',
          description: 'Ensemble of decision trees. More accurate but less interpretable than a single tree.'
        },
        { 
          type: 'xgboost', 
          label: 'XGBoost',
          description: 'Advanced gradient boosting algorithm. Excellent performance on many tasks.'
        },
      ];

  const handleModelToggle = (modelType: ModelType) => {
    if (selectedModels.includes(modelType)) {
      onModelsSelect(selectedModels.filter(m => m !== modelType));
    } else {
      onModelsSelect([...selectedModels, modelType]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Models to Compare</CardTitle>
        <CardDescription>
          Choose one or more models to train and compare their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          {availableModels.map((model) => (
            <div 
              key={model.type} 
              className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedModels.includes(model.type) 
                  ? 'border-2 border-ml-primary bg-blue-50' 
                  : 'border border-gray-200 hover:border-gray-300'}`}
              onClick={() => handleModelToggle(model.type)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={model.type}
                  checked={selectedModels.includes(model.type)}
                  onCheckedChange={() => handleModelToggle(model.type)}
                />
                <Label htmlFor={model.type} className="text-lg font-medium cursor-pointer">{model.label}</Label>
                {selectedModels.includes(model.type) && (
                  <Badge className="ml-auto" variant="outline">Selected</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">{model.description}</p>
            </div>
          ))}
        </div>

        {selectedModels.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              Selected {selectedModels.length} {selectedModels.length === 1 ? 'model' : 'models'} for training
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiModelSelection;
