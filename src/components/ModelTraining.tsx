
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ModelType, ModelParams } from './ModelSelection';

type MetricData = {
  iteration: number;
  loss: number;
  accuracy?: number;
  r2?: number;
};

type ConfusionMatrix = number[][];

type FeatureImportance = {
  feature: string;
  importance: number;
}[];

type ModelTrainingProps = {
  featureNames: string[];
  targetName: string;
  taskType: 'classification' | 'regression';
  modelType: ModelType;
  modelParams: ModelParams;
  onTrainingComplete: (modelInfo: any) => void;
};

const generateTrainingData = (
  iterations: number,
  taskType: 'classification' | 'regression'
): MetricData[] => {
  const baseAccuracy = 0.7;
  const baseR2 = 0.5;
  const data: MetricData[] = [];

  for (let i = 1; i <= iterations; i++) {
    const progress = i / iterations;
    const noise = (Math.random() - 0.5) * 0.05;
    
    const dataPoint: MetricData = {
      iteration: i,
      loss: Math.max(0.1, 1 - (0.7 * progress) + noise)
    };

    if (taskType === 'classification') {
      dataPoint.accuracy = Math.min(0.98, baseAccuracy + (0.25 * progress) + noise);
    } else {
      dataPoint.r2 = Math.min(0.95, baseR2 + (0.4 * progress) + noise);
    }
    
    data.push(dataPoint);
  }

  return data;
};

const ModelTraining: React.FC<ModelTrainingProps> = ({
  featureNames,
  targetName,
  taskType,
  modelType,
  modelParams,
  onTrainingComplete
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<MetricData[]>([]);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionMatrix>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance>([]);
  const [trainTime, setTrainTime] = useState<number | null>(null);

  // Generate mock confusion matrix for classification
  const generateConfusionMatrix = () => {
    const size = Math.floor(Math.random() * 3) + 2; // 2 to 4 classes
    const matrix: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        if (i === j) {
          // Higher values on diagonal (true predictions)
          row.push(Math.floor(Math.random() * 100) + 50);
        } else {
          // Lower values off diagonal (false predictions)
          row.push(Math.floor(Math.random() * 20));
        }
      }
      matrix.push(row);
    }
    
    return matrix;
  };

  // Generate feature importance
  const generateFeatureImportance = () => {
    const importances: FeatureImportance = [];
    let totalImportance = 0;
    
    // Generate random importance values
    featureNames.forEach(feature => {
      const importance = Math.random();
      totalImportance += importance;
      importances.push({ feature, importance });
    });
    
    // Normalize and sort by importance
    return importances
      .map(item => ({
        feature: item.feature,
        importance: item.importance / totalImportance
      }))
      .sort((a, b) => b.importance - a.importance);
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setTrainingMetrics([]);
    
    const startTime = Date.now();
    
    // Simulate training process
    const iterations = modelType === 'xgboost' || modelType === 'random_forest' ? 100 : 50;
    let currentIteration = 0;
    
    const interval = setInterval(() => {
      currentIteration++;
      const newProgress = Math.min(100, Math.round((currentIteration / iterations) * 100));
      setProgress(newProgress);
      
      // Add new metrics
      setTrainingMetrics(prev => [
        ...prev,
        ...generateTrainingData(1, taskType).map(d => ({
          ...d,
          iteration: prev.length + 1
        }))
      ]);
      
      if (currentIteration >= iterations) {
        clearInterval(interval);
        const endTime = Date.now();
        setTrainTime((endTime - startTime) / 1000);
        setIsTraining(false);
        
        // Generate final metrics
        setConfusionMatrix(taskType === 'classification' ? generateConfusionMatrix() : []);
        setFeatureImportance(generateFeatureImportance());
        
        // Notify parent component
        onTrainingComplete({
          metrics: generateTrainingData(iterations, taskType),
          confusionMatrix: taskType === 'classification' ? generateConfusionMatrix() : [],
          featureImportance: generateFeatureImportance(),
          trainTime: (endTime - startTime) / 1000
        });
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      // Clean up any intervals
      const intervals = window.setInterval(() => {}, 0);
      for (let i = 0; i <= intervals; i++) {
        window.clearInterval(i);
      }
    };
  }, []);

  const formatConfusionMatrix = () => {
    if (confusionMatrix.length === 0) return [];
    
    const classes = Array.from({ length: confusionMatrix.length }, (_, i) => `Class ${i}`);
    
    return confusionMatrix.map((row, i) => ({
      name: `Actual: ${classes[i]}`,
      ...row.reduce((acc, val, j) => {
        acc[`Predicted: ${classes[j]}`] = val;
        return acc;
      }, {} as Record<string, number>)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Training Status</span>
            {trainTime !== null && !isTraining && (
              <span className="text-sm font-normal text-gray-500">
                Training completed in {trainTime.toFixed(2)}s
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-semibold mb-1">Features</p>
                <p className="text-sm text-gray-600">{featureNames.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Target</p>
                <p className="text-sm text-gray-600">{targetName}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Model Parameters</p>
                <ul className="text-xs text-gray-600">
                  {Object.entries(modelParams).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>
              
              <Button 
                onClick={handleStartTraining}
                disabled={isTraining}
              >
                {isTraining ? "Training..." : "Start Training"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {(trainingMetrics.length > 0 || featureImportance.length > 0) && (
        <Tabs defaultValue="training-curve">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="training-curve">Training Curve</TabsTrigger>
            {taskType === 'classification' && confusionMatrix.length > 0 && (
              <TabsTrigger value="confusion-matrix">Confusion Matrix</TabsTrigger>
            )}
            <TabsTrigger value="feature-importance">Feature Importance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="training-curve" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Training Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trainingMetrics}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="iteration" 
                        label={{ value: 'Iteration', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="loss" 
                        stroke="#ef4444" 
                        name="Loss" 
                      />
                      {taskType === 'classification' && (
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#4F46E5" 
                          name="Accuracy" 
                        />
                      )}
                      {taskType === 'regression' && (
                        <Line 
                          type="monotone" 
                          dataKey="r2" 
                          stroke="#10B981" 
                          name="R² Score" 
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {taskType === 'classification' && confusionMatrix.length > 0 && (
            <TabsContent value="confusion-matrix" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Confusion Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-4 gap-1">
                      <div className="col-span-1"></div>
                      <div className="col-span-3 text-center font-medium text-sm">Predicted</div>
                      <div className="text-right pr-2 font-medium text-sm">Actual</div>
                      {formatConfusionMatrix().map((row, i) => (
                        <React.Fragment key={i}>
                          <div className="text-right pr-2 font-medium text-sm">{row.name?.split(": ")[1]}</div>
                          {Object.entries(row)
                            .filter(([key]) => key.startsWith('Predicted'))
                            .map(([key, value], j) => (
                              <div 
                                key={j} 
                                className={`text-center p-2 rounded ${
                                  key.split(": ")[1] === row.name?.split(": ")[1]
                                    ? 'bg-green-100' 
                                    : 'bg-red-50'
                                }`}
                              >
                                {value}
                              </div>
                            ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="feature-importance" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureImportance}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax']} />
                      <YAxis 
                        type="category" 
                        dataKey="feature" 
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                      />
                      <Bar dataKey="importance" fill="#4F46E5">
                        {featureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${240 - index * (240 / featureImportance.length)}, 70%, 50%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ModelTraining;
