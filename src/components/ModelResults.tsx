
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area
} from 'recharts';
import { ModelType } from './ModelSelection';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';

type ModelResultsProps = {
  modelType: ModelType;
  taskType: 'classification' | 'regression';
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    r2?: number;
    mse?: number;
    mae?: number;
  };
  featureImportance: { feature: string; importance: number }[];
  predictions?: { actual: number; predicted: number }[];
};

const ModelResults: React.FC<ModelResultsProps> = ({
  modelType,
  taskType,
  metrics,
  featureImportance,
  predictions = []
}) => {
  // Generate residuals for regression
  const residualData = predictions.map((p, idx) => ({
    id: idx,
    predicted: p.predicted,
    actual: p.actual,
    residual: p.actual - p.predicted
  }));

  // Generate ROC curve data points (mocked for classification)
  const generateROCData = () => {
    const points = [];
    points.push({ fpr: 0, tpr: 0 });

    // Generate points along a curve similar to a good ROC curve
    for (let i = 1; i <= 10; i++) {
      // Create a curve that bends towards top-left (good performance)
      const x = i / 10;
      const tpr = 1 - Math.pow(1 - x, 2.5 + Math.random() * 0.5);
      points.push({ fpr: x, tpr });
    }
    
    points.push({ fpr: 1, tpr: 1 });
    return points;
  };

  const rocData = taskType === 'classification' ? generateROCData() : [];

  // Calculate AUC from ROC data
  const calculateAUC = (data: { fpr: number, tpr: number }[]) => {
    let auc = 0;
    for (let i = 1; i < data.length; i++) {
      auc += (data[i].fpr - data[i-1].fpr) * (data[i].tpr + data[i-1].tpr) / 2;
    }
    return auc;
  };

  const aucScore = calculateAUC(rocData);

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF report
    alert('This would download a PDF report with all model metrics and visualizations.');
  };

  const handleDownloadModel = () => {
    // In a real app, this would download the trained model
    alert('This would download the trained model for external use.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{taskType === 'classification' ? 'Classification' : 'Regression'} Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {taskType === 'classification' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Accuracy</p>
                    <p className="text-2xl font-bold">{(metrics.accuracy || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">F1 Score</p>
                    <p className="text-2xl font-bold">{(metrics.f1 || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Precision</p>
                    <p className="text-2xl font-bold">{(metrics.precision || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Recall</p>
                    <p className="text-2xl font-bold">{(metrics.recall || 0).toFixed(4)}</p>
                  </div>
                </>
              )}
              
              {taskType === 'regression' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">R² Score</p>
                    <p className="text-2xl font-bold">{(metrics.r2 || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Mean Squared Error</p>
                    <p className="text-2xl font-bold">{(metrics.mse || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Mean Absolute Error</p>
                    <p className="text-2xl font-bold">{(metrics.mae || 0).toFixed(4)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Root MSE</p>
                    <p className="text-2xl font-bold">{(Math.sqrt(metrics.mse || 0)).toFixed(4)}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Model Type</p>
                <p className="text-lg font-semibold mt-1">
                  {modelType === 'linear_regression' ? 'Linear Regression' : 
                   modelType === 'decision_tree' ? 'Decision Tree' :
                   modelType === 'random_forest' ? 'Random Forest' :
                   modelType === 'xgboost' ? 'XGBoost' :
                   modelType === 'logistic_regression' ? 'Logistic Regression' : 
                   'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Task Type</p>
                <p className="text-lg capitalize mt-1">{taskType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Feature Count</p>
                <p className="text-lg mt-1">{featureImportance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={taskType === 'classification' ? "roc" : "residuals"}>
        <TabsList className="grid w-full grid-cols-3">
          {taskType === 'classification' && (
            <TabsTrigger value="roc">ROC Curve</TabsTrigger>
          )}
          {taskType === 'regression' && (
            <TabsTrigger value="residuals">Residuals</TabsTrigger>
          )}
          <TabsTrigger value="actual-vs-predicted">Actual vs Predicted</TabsTrigger>
          <TabsTrigger value="feature-importance">Feature Importance</TabsTrigger>
        </TabsList>
        
        {taskType === 'classification' && (
          <TabsContent value="roc" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>ROC Curve</CardTitle>
                <CardDescription>Area Under Curve (AUC): {aucScore.toFixed(4)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={rocData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fpr" 
                        name="False Positive Rate"
                        domain={[0, 1]}
                        label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        dataKey="tpr"
                        name="True Positive Rate"
                        domain={[0, 1]}
                        label={{ value: 'True Positive Rate', position: 'insideLeft', angle: -90 }} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(4), value === rocData[0].fpr ? 'False Positive Rate' : 'True Positive Rate']}
                        labelFormatter={() => 'ROC Point'} 
                      />
                      <defs>
                        <linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="tpr" 
                        stroke="#8884d8" 
                        fill="url(#colorTpr)" 
                        activeDot={{ r: 8 }} 
                      />
                      {/* Reference line for random classifier */}
                      <Line
                        type="monotone"
                        dataKey="fpr"
                        stroke="#777777"
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                        name="Random Classifier"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {taskType === 'regression' && (
          <TabsContent value="residuals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Residual Plot</CardTitle>
                <CardDescription>Shows the difference between predicted and actual values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="predicted" 
                        name="Predicted Value"
                        label={{ value: 'Predicted Value', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        dataKey="residual"
                        name="Residual"
                        label={{ value: 'Residual', position: 'insideLeft', angle: -90 }} 
                      />
                      <ZAxis range={[40, 40]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        formatter={(value: number) => [value.toFixed(4), value === residualData[0].predicted ? 'Predicted Value' : 'Residual']}
                        labelFormatter={(value) => `Point ${value}`} 
                      />
                      <Scatter 
                        name="Residuals" 
                        data={residualData} 
                        fill="#4F46E5" 
                      />
                      {/* Reference line at y=0 */}
                      <ReferenceLine 
                        y={0} 
                        stroke="red" 
                        strokeDasharray="3 3" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="actual-vs-predicted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Actual vs Predicted Values</CardTitle>
              <CardDescription>Comparison of model predictions against actual values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="actual" 
                      name="Actual Value"
                      type="number"
                      label={{ value: 'Actual Value', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      dataKey="predicted"
                      name="Predicted Value"
                      type="number"
                      label={{ value: 'Predicted Value', position: 'insideLeft', angle: -90 }} 
                    />
                    <ZAxis range={[40, 40]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      formatter={(value: number) => [value.toFixed(4), value === predictions[0]?.actual ? 'Actual Value' : 'Predicted Value']}
                      labelFormatter={(value) => `Point ${value}`} 
                    />
                    <Legend />
                    <Scatter 
                      name="Values" 
                      data={predictions} 
                      fill="#8884d8" 
                    />
                    {/* Reference line for perfect predictions */}
                    <Line
                      name="Perfect Prediction"
                      type="monotone"
                      dataKey="actual"
                      data={[
                        { actual: Math.min(...predictions.map(p => p.actual)), predicted: Math.min(...predictions.map(p => p.actual)) },
                        { actual: Math.max(...predictions.map(p => p.actual)), predicted: Math.max(...predictions.map(p => p.actual)) }
                      ]}
                      stroke="red"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feature-importance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>Relative importance of each feature in the model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={featureImportance.slice(0, 15)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      width={150} 
                    />
                    <Tooltip
                      formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                    />
                    <Bar 
                      dataKey="importance" 
                      fill="#4F46E5" 
                      name="Importance" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Download model artifacts for external use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDownloadReport} className="flex items-center gap-2">
              <Download size={16} />
              Download Report
            </Button>
            <Button onClick={handleDownloadModel} variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Model
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Import ReferenceLine component
import { ReferenceLine } from 'recharts';

export default ModelResults;
