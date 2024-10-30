import { useRef, useEffect, useMemo, useState } from 'react';
import { ParsedData, ColumnConfig, HeaderConfig as HeaderConfigType, SkipCondition } from '../types/index';
import { useResizableColumns } from '../hooks/useResizableColumns';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table as TableIcon, FileQuestion, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';

interface DataPreviewProps {
  data: ParsedData;
  columnConfig: Record<string, ColumnConfig>;
  isLoading?: boolean;
  headerConfig: HeaderConfigType;
  onHeaderConfigChange: (config: HeaderConfigType) => void;
}

export default function DataPreview({ 
  data, 
  columnConfig, 
  isLoading,
  headerConfig,
  onHeaderConfigChange 
}: DataPreviewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const visibleHeaders = useMemo(() => [
    ...data.headers.filter(header => columnConfig[header]?.include),
    ...Object.entries(columnConfig)
      .filter(([, config]) => config.isCustom && config.include)
      .map(([header]) => header)
  ], [data.headers, columnConfig]);

  const hasVisibleData = visibleHeaders.length > 0 && data.preview.length > 0;

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

  // Create full data rows with custom columns
  const enhancedRows = data.rows.map(row => {
    const rowData: Record<string, string> = {};
    data.headers.forEach((header, index) => {
      if (columnConfig[header]?.include) {
        rowData[header] = row[index] || '';
      }
    });
    // Add custom columns
    Object.entries(columnConfig)
      .filter(([, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        rowData[header] = config.defaultValue || '';
      });
    return rowData;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TableIcon className="w-5 h-5" />
          Data Preview
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configure Headers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Header Rows</DialogTitle>
            </DialogHeader>
            <HeaderConfigPanel 
              config={headerConfig}
              onConfigChange={onHeaderConfigChange}
              totalRows={data.rows.length}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Preview Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <TableIcon className="w-10 h-10 mb-4 animate-pulse" />
              <p>Loading preview...</p>
            </div>
          </CardContent>
        </Card>
      ) : !hasVisibleData ? (
        <Card>
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <FileQuestion className="w-10 h-10 mb-4" />
              <p className="text-lg font-medium mb-2">No data to preview</p>
              <p className="text-sm text-center max-w-md">
                {data.headers.length === 0 
                  ? "Upload a CSV file to see a preview of your data here"
                  : "Enable some columns in the Column Manager to see your data"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        renderTable(enhancedRows)
      )}
    </div>
  );

  function renderTable(tableData: Record<string, string>[]) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Data Preview</h4>
              <span className="text-sm text-muted-foreground">
                Showing {tableData.length} rows
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={tableRef} 
              className="border rounded-lg"
            >
              <div className="overflow-auto h-[calc(100vh-400px)]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background border-b">
                    <TableRow>
                      {visibleHeaders.map((header, index) => (
                        <TableHead
                          key={`header-${index}-${header}`}
                          className={cn(
                            "relative select-none bg-background",
                            resizingColumn === header && "bg-muted"
                          )}
                          style={{ width: columnWidths[header] }}
                          data-column={header}
                        >
                          <div className="flex items-center pr-6">
                            <span className="truncate">
                              {columnConfig[header]?.mappedName || header}
                            </span>
                            <div
                              className={cn(
                                "absolute right-0 top-0 bottom-0 w-6 cursor-col-resize select-none flex items-center justify-center",
                                "after:content-[''] after:absolute after:right-2 after:w-px after:h-4/5 after:bg-border",
                                "hover:after:bg-foreground",
                                resizingColumn === header && "after:bg-foreground"
                              )}
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
                    {tableData.map((row, rowIndex) => (
                      <TableRow key={`row-${rowIndex}`}>
                        {visibleHeaders.map((header, colIndex) => {
                          const content = row[header];
                          const hasNewlines = content?.includes('\n');

                          return (
                            <TableCell
                              key={`cell-${rowIndex}-${colIndex}`}
                              style={{ 
                                width: columnWidths[header],
                                maxWidth: '400px',
                                verticalAlign: 'top'
                              }}
                              data-column={header}
                            >
                              <div 
                                className={cn(
                                  "min-w-0",
                                  hasNewlines 
                                    ? "whitespace-pre-wrap break-words py-2" 
                                    : "truncate"
                                )}
                                title={content || ''}
                              >
                                {content || ''}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
}

// Internal HeaderConfigPanel component
function HeaderConfigPanel({ config, onConfigChange, totalRows }: {
  config: HeaderConfigType;
  onConfigChange: (config: HeaderConfigType) => void;
  totalRows?: number;
}) {
  const [localConfig, setLocalConfig] = useState(config);
  const [error, setError] = useState<string | null>(null);
  const [skipCondition, setSkipCondition] = useState<SkipCondition>(
    config.skipCondition || { type: 'empty' }
  );

  useEffect(() => {
    setLocalConfig(config);
    if (config.skipCondition) {
      setSkipCondition(config.skipCondition);
    }
  }, [config]);

  const handleHeaderRowsChange = (value: number) => {
    const newValue = Math.max(1, value);
    
    if (totalRows && newValue >= totalRows) {
      setError(`Header rows cannot exceed total rows (${totalRows})`);
      return;
    }

    setError(null);
    const newConfig = {
      ...localConfig,
      headerRows: newValue
    };
    
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Header Rows */}
        <div className="space-y-2">
          <Label>Header Rows</Label>
          <Input
            type="number"
            min="1"
            max={totalRows ? totalRows - 1 : 10}
            value={localConfig.headerRows}
            onChange={(e) => handleHeaderRowsChange(parseInt(e.target.value) || 1)}
            className={cn(error && "border-destructive")}
          />
          <p className="text-xs text-muted-foreground">
            Select how many rows contain headers
          </p>
        </div>

        {/* Skip Empty Rows */}
        <div className="space-y-2">
          <Label>Skip Empty Rows</Label>
          <Select
            value={skipCondition.type}
            onValueChange={(value) => {
              const newCondition = { type: value as SkipCondition['type'], value: '' };
              setSkipCondition(newCondition);
              onConfigChange({ ...localConfig, skipCondition: newCondition });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="empty">Skip Empty Rows</SelectItem>
              <SelectItem value="number">Skip Number of Rows</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how to handle empty or skipped rows
          </p>
        </div>

        {/* Number of Rows */}
        {skipCondition.type === 'number' && (
          <div className="space-y-2">
            <Label>Number of Rows</Label>
            <Input
              type="number"
              min="0"
              max={totalRows ? totalRows - config.headerRows - 1 : 10}
              value={skipCondition.value || ''}
              onChange={(e) => {
                const newCondition = { ...skipCondition, value: e.target.value };
                setSkipCondition(newCondition);
                onConfigChange({ ...localConfig, skipCondition: newCondition });
              }}
              placeholder="e.g., 1"
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}