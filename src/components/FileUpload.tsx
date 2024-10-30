import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Loader2, AlertCircle, Clipboard } from 'lucide-react';
import { cn } from "@/lib/utils";
import { parseCSV } from '@/utils/csvParser/parser';
import { HeaderConfig } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  currentFileName: string;
  headerConfig: HeaderConfig;
}

const processCSVContent = (content: string): string => {
  let inQuotes = false;
  let currentField = '';
  let buffer = '';

  // First normalize line endings
  const normalized = content.replace(/\r\n|\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (char === '"') {
      if (!inQuotes) {
        // Starting quoted field
        inQuotes = true;
        buffer += char;
      } else if (nextChar === '"') {
        // Escaped quote
        buffer += char + nextChar;
        i++; // Skip next quote
      } else {
        // Ending quoted field
        inQuotes = false;
        // If we have collected content, join it properly
        if (currentField) {
          buffer += currentField.replace(/\n+/g, ' ').trim();
          currentField = '';
        }
        buffer += char;
      }
    } else if (inQuotes) {
      if (char === '\n') {
        // Inside quotes, collect content but don't add newline yet
        if (currentField) {
          currentField += ' ';
        }
      } else {
        currentField += char;
      }
    } else {
      buffer += char;
    }
  }

  return buffer;
};

export default function FileUpload({ onFileSelect, currentFileName, headerConfig }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(Math.min(90, progress));
        }
      };

      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Process the CSV content before passing it on
        const processedContent = processCSVContent(content);
        
        setFileContent(processedContent);
        onFileSelect(processedContent, file.name);
        
        try {
          parseCSV(processedContent, headerConfig);
        } catch (parseError) {
          console.error('CSV parsing error:', parseError);
        }

        setUploadProgress(100);
        setIsProcessing(false);
      };

      reader.onerror = () => {
        setError('Error reading file');
        setIsProcessing(false);
      };

      reader.readAsText(file);
    } catch (processError) {
      console.error('File processing error:', processError);
      setError('Error processing file');
      setIsProcessing(false);
    }
  }, [onFileSelect, headerConfig]);

  useEffect(() => {
    if (fileContent) {
      try {
        parseCSV(fileContent, headerConfig);
      } catch (error) {
        console.error('CSV parsing error:', error);
      }
    }
  }, [fileContent, headerConfig]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handlePaste = useCallback(async (content: string) => {
    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const firstLine = content.trim().split('\n')[0];
      if (!firstLine || firstLine.length === 0) {
        throw new Error('Content appears to be empty');
      }

      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Content needs at least a header row and one data row');
      }

      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadProgress(60);

      setFileContent(content);
      onFileSelect(content, 'pasted-content.csv');
      
      try {
        parseCSV(content, headerConfig);
      } catch (parseError) {
        console.error('CSV parsing error:', parseError);
        throw new Error('Failed to parse CSV content. Please check the format.');
      }

      setUploadProgress(100);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process pasted content');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileSelect, headerConfig]);

  const handlePasteSubmit = () => {
    handlePaste(pasteContent);
    setPasteDialogOpen(false);
    setPasteContent('');
  };

  if (currentFileName) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{currentFileName}</span>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paste CSV Content</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Paste your CSV content here..."
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    className="min-h-[300px] font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPasteDialogOpen(false);
                        setPasteContent('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasteSubmit}
                      disabled={!pasteContent.trim()}
                    >
                      Process CSV
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" size="sm" asChild disabled={isProcessing}>
              <label className="cursor-pointer flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isProcessing ? "Processing..." : "Upload File"}
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </Button>
          </div>
        </CardContent>
        {isProcessing && (
          <Progress value={uploadProgress} className="h-1" />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8",
          "transition-colors duration-200",
          isDragging ? "border-primary bg-primary/5" : "border-muted",
          isProcessing && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className={cn(
            "w-12 h-12",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              Drag and drop your CSV file here, or
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Button variant="secondary" size="sm" asChild>
                <label className="cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processFile(file);
                    }}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              </Button>
              
              <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Paste CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paste CSV Content</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Textarea
                      placeholder="Paste your CSV content here..."
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      className="min-h-[300px] font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPasteDialogOpen(false);
                          setPasteContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePasteSubmit}
                        disabled={!pasteContent.trim()}
                      >
                        Process CSV
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
        {isProcessing && (
          <Progress value={uploadProgress} className="mt-4" />
        )}
      </div>
    </Card>
  );
}