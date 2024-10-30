import { useState, useCallback, useEffect, useMemo } from 'react';

interface ColumnWidth {
  [key: string]: number;
}

export function useResizableColumns(headers: string[]) {
  const initialWidths = useMemo(() => {
    const widths: ColumnWidth = {};
    headers.forEach(header => {
      widths[header] = 200;
    });
    return widths;
  }, []);

  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(initialWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  useEffect(() => {
    const newHeaders = headers.filter(header => !columnWidths[header]);
    if (newHeaders.length === 0) return;

    setColumnWidths(prev => {
      const updated = { ...prev };
      newHeaders.forEach(header => {
        updated[header] = 200;
      });
      return updated;
    });
  }, [headers]);

  const handleResizeStart = useCallback((header: string) => {
    setResizingColumn(header);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  const handleResize = useCallback((header: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [header]: Math.max(100, width)
    }));
  }, []);

  return {
    columnWidths,
    resizingColumn,
    handleResizeStart,
    handleResizeEnd,
    handleResize
  };
}