import { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ColumnManager from './components/ColumnManager';
import DataPreview from './components/DataPreview';
import { ParsedData, HeaderConfig, ColumnConfig } from './types/index';
import { parseCSV, convertToJSON } from './utils/csvParser';
import DownloadButton from '@/components/DownloadButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Columns } from 'lucide-react';
import JsonPreview from '@/components/JsonPreview';
import { normalizeJson } from '@/utils/normalizeJson';

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
    skipCondition: { type: 'empty' }
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

  const handleDownload = async () => {
    return new Promise<void>((resolve) => {
      const jsonContent = convertToJSON(parsedData, columnConfig);
      const normalizedJson = normalizeJson(jsonContent);
      
      const blob = new Blob([JSON.stringify(normalizedJson, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName?.replace('.csv', '.json') || 'converted.json';
      
      setTimeout(() => {
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 800);
    });
  };

  const handleColumnConfigChange = useCallback((newConfig: Record<string, ColumnConfig>) => {
    setColumnConfig(newConfig);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative pb-16">
      {csvContent && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <JsonPreview 
            parsedData={parsedData}
            columnConfig={columnConfig}
            className="shadow-lg"
          />
          <DownloadButton 
            onDownload={handleDownload}
            className="shadow-lg"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8">
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
            headerConfig={headerConfig}
          />

          {csvContent && (
            <Tabs defaultValue="preview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  Data Preview
                </TabsTrigger>
                <TabsTrigger value="columns" className="flex items-center gap-2">
                  <Columns className="w-4 h-4" />
                  Column Manager
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-6">
                <DataPreview
                  data={parsedData}
                  columnConfig={columnConfig}
                  headerConfig={headerConfig}
                  onHeaderConfigChange={handleHeaderConfigChange}
                />
              </TabsContent>

              <TabsContent value="columns" className="mt-6">
                <ColumnManager
                  headers={parsedData.headers}
                  columnConfig={columnConfig}
                  onConfigChange={handleColumnConfigChange}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}