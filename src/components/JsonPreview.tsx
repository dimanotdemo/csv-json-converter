import { useState, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ParsedData, ColumnConfig } from '@/types';
import { convertToJSON } from '@/utils/csvParser';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';
import { normalizeJson } from '@/utils/normalizeJson';

interface JsonPreviewProps {
  parsedData: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
  className?: string;
}

export default function JsonPreview({ parsedData, columnConfig, className }: JsonPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [highlightedContent, setHighlightedContent] = useState<string>('');

  const generatePreview = useCallback(() => {
    const json = convertToJSON(parsedData, columnConfig);
    const normalizedJson = normalizeJson(json);
    const formatted = JSON.stringify(normalizedJson, null, 2);
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