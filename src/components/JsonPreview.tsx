import { useState, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ParsedData, ColumnConfig } from '@/types';
import { convertToJSON } from '@/utils/csvParser/converter';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';
import { normalizeJson } from '@/utils/normalizeJson';

interface JsonPreviewProps {
  parsedData: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
  columnOrder?: string[];
  className?: string;
}

export default function JsonPreview({ parsedData, columnConfig, columnOrder, className }: JsonPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [highlightedContent, setHighlightedContent] = useState<string>('');

  useEffect(() => {
    const json = convertToJSON(parsedData, columnConfig, columnOrder);
    const normalizedJson = normalizeJson(json);
    const formatted = JSON.stringify(normalizedJson, null, 2);
    setJsonContent(formatted);
  }, [parsedData, columnConfig, columnOrder]);

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

  const handlePreviewClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={className}
          onClick={handlePreviewClick}
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