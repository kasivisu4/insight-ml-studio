
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ModelType, ModelParams, defaultModelParams } from './ModelSelection';

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
  const availableModels: { type: ModelType; label: string }[] = taskType === 'classification' 
    ? [
        { type: 'logistic_regression', label: 'Logistic Regression' },
        { type: 'decision_tree', label: 'Decision Tree' },
        { type: 'random_forest', label: 'Random Forest' },
        { type: 'xgboost', label: 'XGBoost' },
      ]
    : [
        { type: 'linear_regression', label: 'Linear Regression' },
        { type: 'decision_tree', label: 'Decision Tree' },
        { type: 'random_forest', label: 'Random Forest' },
        { type: 'xgboost', label: 'XGBoost' },
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
        <div className="grid gap-4">
          {availableModels.map((model) => (
            <div key={model.type} className="flex items-center space-x-2">
              <Checkbox
                id={model.type}
                checked={selectedModels.includes(model.type)}
                onCheckedChange={() => handleModelToggle(model.type)}
              />
              <Label htmlFor={model.type}>{model.label}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiModelSelection;
