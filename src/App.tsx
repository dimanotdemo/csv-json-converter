import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FileUpload from './components/FileUpload';
import HeaderConfigPanel from './components/HeaderConfig';
import ColumnManager from './components/ColumnManager';
import DataPreview from './components/DataPreview';
import { ParsedData, HeaderConfig, ColumnConfig } from './types/index';
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
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const initializeColumnConfig = useCallback((headers: string[], secondRowHeaders: string[]) => {
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
  }, [columnConfig]);

  const handleFileSelect = useCallback((content: string, fileName: string) => {
    setCsvContent(content);
    setCurrentFileName(fileName);
    const data = parseCSV(content, headerConfig);
    setParsedData(data);
    setColumnConfig(initializeColumnConfig(data.headers, data.secondRowHeaders));
  }, [headerConfig, initializeColumnConfig]);

  const handleHeaderConfigChange = useCallback((newConfig: HeaderConfig) => {
    setHeaderConfig(newConfig);
    if (csvContent) {
      const data = parseCSV(csvContent, newConfig);
      setParsedData(data);
      setColumnConfig(initializeColumnConfig(data.headers, data.secondRowHeaders));
    }
  }, [csvContent, initializeColumnConfig]);

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

  const handleColumnConfigChange = useCallback((newConfig: Record<string, ColumnConfig>) => {
    setColumnConfig(newConfig);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative pb-16">
      {csvContent && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            onClick={handleDownload}
            className="shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CSV to JSON Converter
          </h1>
          <p className="text-gray-600">
            Upload your CSV file, configure the conversion settings, and download the result
          </p>
        </header>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            currentFileName={currentFileName}
          />

          {csvContent && (
            <>
              <DataPreview
                data={parsedData}
                columnConfig={columnConfig}
              />

              <HeaderConfigPanel
                config={headerConfig}
                onConfigChange={handleHeaderConfigChange}
              />

              <ColumnManager
                headers={parsedData.headers}
                columnConfig={columnConfig}
                onConfigChange={handleColumnConfigChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}