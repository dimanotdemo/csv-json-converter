import { useState, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ParsedData, ColumnConfig } from '@/types';
import { convertToJSON } from '@/utils/csvParser';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';

interface JsonPreviewProps {
  parsedData: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
  className?: string;
}

type RecursiveObject = {
  [key: string]: string | number | boolean | null | RecursiveObject | RecursiveObject[];
};

export default function JsonPreview({ parsedData, columnConfig, className }: JsonPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [highlightedContent, setHighlightedContent] = useState<string>('');

  const generatePreview = useCallback(() => {
    const json = convertToJSON(parsedData, columnConfig);
    
    // Convert all object keys to lowercase recursively
    const lowercaseKeys = (obj: RecursiveObject[]): RecursiveObject[] => {
      return obj.map(item => {
        const result: RecursiveObject = {};
        
        Object.entries(item).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            result[key.toLowerCase()] = value.map(v => 
              typeof v === 'object' && v !== null 
                ? lowercaseKeys([v as RecursiveObject])[0] 
                : v
            );
          } else if (value !== null && typeof value === 'object') {
            result[key.toLowerCase()] = lowercaseKeys([value as RecursiveObject])[0];
          } else {
            result[key.toLowerCase()] = value;
          }
        });
        
        return result;
      });
    };

    const lowercaseJson = lowercaseKeys(json as unknown as RecursiveObject[]);
    const formatted = JSON.stringify(lowercaseJson, null, 2);
    setJsonContent(formatted);
    setIsOpen(true);
  }, [parsedData, columnConfig]);

  useEffect(() => {
    if (jsonContent) {
      const highlighted = Prism.highlight(
        jsonContent,
        Prism.languages.json,
        'json'
      );
      setHighlightedContent(highlighted);
    }
  }, [jsonContent]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={className}
          onClick={generatePreview}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview JSON
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>JSON Preview</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <pre 
            className="bg-zinc-950 p-4 rounded-lg overflow-auto max-h-[90vh] text-sm"
          >
            <code 
              className="language-json"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
} 