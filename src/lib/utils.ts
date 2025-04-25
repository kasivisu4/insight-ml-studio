
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseCSV = (csvString: string) => {
  const rows = csvString.trim().split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  
  const data = rows.slice(1).map((row, idx) => {
    const values = row.split(',').map(v => v.trim());
    const rowData: Record<string, any> = { id: idx };
    
    headers.forEach((header, i) => {
      const value = values[i];
      if (value === undefined) return;
      
      // Try to convert to number if possible
      const numValue = Number(value);
      rowData[header] = isNaN(numValue) ? value : numValue;
    });
    
    return rowData;
  });
  
  return data;
};

export const generateMockClassificationMetrics = () => {
  // Generate realistic-looking metrics
  const accuracy = 0.8 + Math.random() * 0.15;
  const precision = accuracy - 0.05 + Math.random() * 0.1;
  const recall = accuracy - 0.05 + Math.random() * 0.1;
  const f1 = 2 * ((precision * recall) / (precision + recall));

  return {
    accuracy,
    precision,
    recall, 
    f1
  };
};

export const generateMockRegressionMetrics = () => {
  // Generate realistic-looking metrics
  const r2 = 0.7 + Math.random() * 0.25;
  const mse = 0.5 + Math.random() * 2;
  const mae = mse * (0.6 + Math.random() * 0.2);

  return {
    r2,
    mse,
    mae
  };
};

export const generateMockPredictions = (count: number = 100, taskType: 'classification' | 'regression') => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    if (taskType === 'regression') {
      const actual = Math.random() * 100;
      // Make predicted value somewhat correlated to actual
      const predicted = actual * (0.7 + Math.random() * 0.6);
      
      results.push({ actual, predicted });
    } else {
      // For classification, use binary outcome for simplicity
      const actual = Math.random() > 0.5 ? 1 : 0;
      // 80-90% accuracy
      const correctPrediction = Math.random() < 0.85;
      const predicted = correctPrediction ? actual : 1 - actual;
      
      results.push({ actual, predicted });
    }
  }
  
  return results;
};

export const determineTaskType = (
  targetName: string, 
  data: any[]
): 'classification' | 'regression' | null => {
  if (!data || data.length === 0 || !targetName) return null;
  
  // Get unique values in the target column
  const uniqueValues = new Set();
  let numericCount = 0;
  
  data.forEach(row => {
    const value = row[targetName];
    uniqueValues.add(value);
    
    if (typeof value === 'number') {
      numericCount++;
    }
  });
  
  // If we have few unique values (relative to dataset size) and most are non-numeric, 
  // it's likely classification
  if (uniqueValues.size <= 10 || uniqueValues.size / data.length < 0.05) {
    return 'classification';
  }
  
  // If we have many unique values and most are numeric, it's likely regression
  if (numericCount / data.length > 0.9) {
    return 'regression';
  }
  
  // Default to classification if we can't determine
  return 'classification';
};
