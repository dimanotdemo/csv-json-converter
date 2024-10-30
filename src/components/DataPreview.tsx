import { useRef, useEffect, useMemo } from 'react';
import { ParsedData, ColumnConfig } from '../types/index';
import { useResizableColumns } from '../hooks/useResizableColumns';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table as TableIcon } from 'lucide-react';

interface DataPreviewProps {
  data: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
}

export default function DataPreview({ data, columnConfig }: DataPreviewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const visibleHeaders = useMemo(() => [
    ...data.headers.filter(header => columnConfig[header]?.include),
    ...Object.entries(columnConfig)
      .filter(([, config]) => config.isCustom && config.include)
      .map(([header]) => header)
  ], [data.headers, columnConfig]);

  const {
    columnWidths,
    resizingColumn,
    handleResizeStart,
    handleResizeEnd,
    handleResize
  } = useResizableColumns(visibleHeaders);

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tableRef.current || !resizingColumn) return;

      const table = tableRef.current;
      const tableRect = table.getBoundingClientRect();
      const cells = table.querySelectorAll(`[data-column="${resizingColumn}"]`);
      if (cells.length === 0) return;

      const firstCell = cells[0] as HTMLElement;
      const cellRect = firstCell.getBoundingClientRect();
      const minWidth = 100;
      const maxWidth = tableRect.width - (cellRect.left - tableRect.left);
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - cellRect.left));

      handleResize(resizingColumn, newWidth);
      e.preventDefault();
    };

    const handleMouseUp = () => {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      handleResizeEnd();
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [resizingColumn, handleResize, handleResizeEnd]);

  const enhancedPreview = useMemo(() => data.preview.map(row => {
    const enhancedRow = { ...row };
    Object.entries(columnConfig)
      .filter(([, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        enhancedRow[header] = config.defaultValue || '';
      });
    return enhancedRow;
  }), [data.preview, columnConfig]);

  return (
    <>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TableIcon className="w-5 h-5" />
        Data Preview
      </h3>
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium">Data Preview</h4>
        </CardHeader>
        <CardContent>
          <div ref={tableRef} className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleHeaders.map((header, index) => (
                    <TableHead
                      key={`header-${index}-${header}`}
                      className="relative select-none"
                      style={{ width: columnWidths[header] }}
                      data-column={header}
                    >
                      <div className="flex items-center pr-4">
                        <span className="truncate">
                          {columnConfig[header]?.mappedName || header}
                        </span>
                        <div
                          className="absolute right-0 top-0 bottom-0 w-4 hover:bg-gray-300 cursor-col-resize select-none"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleResizeStart(header);
                          }}
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedPreview.map((row, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    {visibleHeaders.map((header, colIndex) => (
                      <TableCell
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={{ width: columnWidths[header] }}
                        data-column={header}
                      >
                        <div className="truncate" title={row[header] || ''}>
                          {row[header] || ''}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}