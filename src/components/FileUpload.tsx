import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileSelect(content);
        }
      };
      reader.readAsText(file);
    },
    [onFileSelect]
  );

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