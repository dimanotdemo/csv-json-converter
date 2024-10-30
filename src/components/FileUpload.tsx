import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  currentFileName?: string;
}

export default function FileUpload({ onFileSelect, currentFileName }: FileUploadProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileSelect(content, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onFileSelect]
  );

  if (currentFileName) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{currentFileName}</span>
          </div>
          
          <Button variant="secondary" size="sm" asChild>
            <label className="cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Replace File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-8">
        <label className="cursor-pointer block text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className={cn(
              "w-8 h-8",
              "text-muted-foreground",
              "group-hover:text-primary"
            )} />
            <span className="text-lg font-medium">Upload CSV File</span>
            <span className="text-sm text-muted-foreground">
              Drop your file here or click to browse
            </span>
          </div>
        </label>
      </CardContent>
    </Card>
  );
}