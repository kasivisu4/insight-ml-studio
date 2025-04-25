
import React, { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, File } from 'lucide-react';

type FileUploadProps = {
  onFileUploaded: (file: File, content: string | ArrayBuffer) => void;
  accept?: string;
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

const FileUpload = ({
  onFileUploaded,
  accept = ".csv,.xlsx,.xls",
  maxSizeMB = 10,
  title = "Upload Dataset",
  description = "Drop your CSV or Excel file here"
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast({
          title: "Invalid file format",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSizeMB}MB`,
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setFileName(file.name);

      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          onFileUploaded(file, e.target.result);
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "There was an error reading your file. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        setFileName(null);
      };
      
      if (file.name.match(/\.csv$/i)) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    },
    [maxSizeMB, onFileUploaded, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragging ? "border-ml-primary bg-blue-50" : "border-gray-300",
        fileName ? "bg-gray-50" : ""
      )}>
        <CardContent className="p-0">
          <div
            className="p-6 flex flex-col items-center justify-center gap-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <FileText className="h-8 w-8 text-ml-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    File uploaded successfully
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setFileName(null);
                  }}
                >
                  Choose another file
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 rounded-full p-3">
                  <Upload className="h-8 w-8 text-ml-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Max file size: {maxSizeMB}MB
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      document.getElementById("file-input")?.click();
                    }}
                  >
                    {isLoading ? "Processing..." : "Browse files"}
                  </Button>
                </div>
              </>
            )}
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept={accept}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Import cn function
import { cn } from '@/lib/utils';

export default FileUpload;
