import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

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
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{currentFileName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md border flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              Replace File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-lg font-medium">Upload CSV File</span>
          <span className="text-sm text-gray-500">
            Drop your file here or click to browse
          </span>
        </div>
      </label>
    </div>
  );
}