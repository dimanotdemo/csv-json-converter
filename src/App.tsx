import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import FileUpload from './components/FileUpload';
import HeaderConfigPanel from './components/HeaderConfig';
import ColumnManager from './components/ColumnManager';
import DataPreview from './components/DataPreview';
import { ParsedData, HeaderConfig, ColumnConfig } from './types';
import { parseCSV, convertToJSON } from './utils/csvParser';

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedData>({
    headers: [],
    rows: [],
    preview: [],
    originalHeaders: [],
    secondRowHeaders: []
  });

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    headerRows: 1,
    skipRows: 0,
    hierarchical: false,
  });

  const [columnConfig, setColumnConfig] = useState<Record<string, ColumnConfig>>({});
  const [csvContent, setCsvContent] = useState<string>('');

  const initializeColumnConfig = (headers: string[], secondRowHeaders: string[]) => {
    const newColumnConfig: Record<string, ColumnConfig> = {};
    headers.forEach((header, index) => {
      newColumnConfig[header] = {
        ...columnConfig[header],
        originalName: header,
        mappedName: secondRowHeaders[index] || header,
        include: true,
        isMetafield: false,
        metafieldNamespace: 'custom',
        metafieldType: 'single_line_text_field',
        isOption: false,
        optionSeparator: ','
      };
    });
    return newColumnConfig;
  };

  const handleFileSelect = useCallback((content: string) => {
    setCsvContent(content);
    const data = parseCSV(content, headerConfig);
    setParsedData(data);
    setColumnConfig(initializeColumnConfig(data.headers, data.secondRowHeaders));
  }, [headerConfig]);

  const handleHeaderConfigChange = useCallback((newConfig: HeaderConfig) => {
    setHeaderConfig(newConfig);
    if (csvContent) {
      const data = parseCSV(csvContent, newConfig);
      setParsedData(data);
      setColumnConfig(initializeColumnConfig(data.headers, data.secondRowHeaders));
    }
  }, [csvContent]);

  const handleDownload = () => {
    const jsonData = convertToJSON(parsedData, columnConfig);
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CSV to JSON Converter
          </h1>
          <p className="text-gray-600">
            Upload your CSV file, configure the conversion settings, and download the result
          </p>
        </header>

        <div className="space-y-8">
          <FileUpload onFileSelect={handleFileSelect} />

          {parsedData.headers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Data Preview</h3>
                <DataPreview data={parsedData} columnConfig={columnConfig} />
              </div>
              
              <HeaderConfigPanel
                config={headerConfig}
                onConfigChange={handleHeaderConfigChange}
              />

              <ColumnManager
                headers={parsedData.headers}
                columnConfig={columnConfig}
                onConfigChange={setColumnConfig}
                originalHeaders={parsedData.originalHeaders}
                secondRowHeaders={parsedData.secondRowHeaders}
              />

              <div className="flex justify-end">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}