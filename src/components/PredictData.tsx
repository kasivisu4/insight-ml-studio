
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from './FileUpload';
import DataTable from './DataTable';
import { ModelType } from './ModelSelection';
import { useToast } from '@/components/ui/use-toast';
import { Check, Download } from 'lucide-react';

type PredictionResult = {
  id: number;
  [key: string]: any;
  prediction: number | string;
};

type PredictDataProps = {
  modelType: ModelType;
  taskType: 'classification' | 'regression';
  featureNames: string[];
};

const PredictData: React.FC<PredictDataProps> = ({
  modelType,
  taskType,
  featureNames
}) => {
  const [testData, setTestData] = useState<any[] | null>(null);
  const [predictedResults, setPredictedResults] = useState<PredictionResult[] | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const { toast } = useToast();

  const handleFileUploaded = (file: File, content: string | ArrayBuffer) => {
    try {
      // Parse CSV data (simplified for demo)
      let data;
      if (typeof content === 'string') {
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        data = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim());
          const row: Record<string, any> = { id: idx };
          
          headers.forEach((header, i) => {
            const value = values[i];
            const numValue = Number(value);
            row[header] = isNaN(numValue) ? value : numValue;
          });
          
          return row;
        });
      } else {
        // For Excel files, would use a library like xlsx in a real app
        data = [{ id: 0, error: "Excel parsing not implemented in this demo" }];
      }
      
      setTestData(data);
      setPredictedResults(null);
      
      toast({
        title: "Test data loaded",
        description: `${data.length} rows imported successfully.`,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error parsing file",
        description: "The file format is not valid. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePredict = () => {
    if (!testData) return;
    
    setIsPredicting(true);
    
    // Simulate processing time
    setTimeout(() => {
      // In a real app, we would send the data to a backend for prediction
      // Here we just generate random predictions
      const results = testData.map(row => {
        const predictionRow = { ...row };
        
        if (taskType === 'regression') {
          // Generate a prediction based on feature values to simulate some correlation
          const baseValue = Object.entries(row)
            .filter(([key]) => featureNames.includes(key))
            .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);
          
          // Add some randomness
          predictionRow.prediction = Math.max(0, baseValue / featureNames.length + (Math.random() - 0.5) * 5);
        } else {
          // For classification, generate class labels
          const classLabels = ['Class A', 'Class B', 'Class C'];
          predictionRow.prediction = classLabels[Math.floor(Math.random() * classLabels.length)];
        }
        
        return predictionRow;
      });
      
      setPredictedResults(results);
      setIsPredicting(false);
      
      toast({
        title: "Predictions complete",
        description: `Generated predictions for ${results.length} rows.`,
      });
    }, 1500);
  };

  const handleDownloadPredictions = () => {
    if (!predictedResults) return;
    
    // In a real app, create a proper CSV
    const headers = Object.keys(predictedResults[0]).join(',');
    const rows = predictedResults.map(row => 
      Object.values(row).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!testData && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Test Data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file containing test data for prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileUploaded={handleFileUploaded}
              title="Upload Test Dataset"
              description="Test data should contain the same features used during training"
            />
          </CardContent>
        </Card>
      )}
      
      {testData && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Test Data</CardTitle>
                <CardDescription>Preview of the uploaded test dataset</CardDescription>
              </div>
              {!predictedResults && (
                <Button 
                  onClick={handlePredict}
                  disabled={isPredicting}
                >
                  {isPredicting ? "Predicting..." : "Run Prediction"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <DataTable data={testData} />
            </CardContent>
          </Card>
          
          {predictedResults && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    Prediction Results
                  </CardTitle>
                  <CardDescription>Model predictions for the test data</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPredictions}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable data={predictedResults} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PredictData;
