import React, { useRef, useEffect, useMemo } from 'react';
import { ParsedData, ColumnConfig } from '../types';
import { useResizableColumns } from '../hooks/useResizableColumns';

interface DataPreviewProps {
  data: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
}

export default function DataPreview({ data, columnConfig }: DataPreviewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const visibleHeaders = useMemo(() => [
    ...data.headers.filter(header => columnConfig[header]?.include),
    ...Object.entries(columnConfig)
      .filter(([_, config]) => config.isCustom && config.include)
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
      .filter(([_, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        enhancedRow[header] = config.defaultValue || '';
      });
    return enhancedRow;
  }), [data.preview, columnConfig]);

  return (
    <div ref={tableRef} className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {visibleHeaders.map((header, index) => (
              <th
                key={`header-${index}-${header}`}
                className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
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
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enhancedPreview.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {visibleHeaders.map((header, colIndex) => (
                <td
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                  style={{ width: columnWidths[header] }}
                  data-column={header}
                >
                  <div className="truncate" title={row[header] || ''}>
                    {row[header] || ''}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}