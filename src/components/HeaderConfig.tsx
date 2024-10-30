import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { HeaderConfig, SkipCondition } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderConfigProps {
  config: HeaderConfig;
  onConfigChange: (config: HeaderConfig) => void;
  totalRows?: number;
}

export default function HeaderConfigPanel({ config, onConfigChange, totalRows }: HeaderConfigProps) {
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
      headerRows: newValue,
      skipRows: Math.min(localConfig.skipRows, Math.max(0, 10 - newValue))
    };
    
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSkipConditionChange = (newCondition: SkipCondition) => {
    setSkipCondition(newCondition);
    const newConfig = {
      ...localConfig,
      skipCondition: newCondition
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Layout className="w-5 h-5" />
        Header Configuration
      </h3>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Configure Header Rows</h4>
            <p className="text-sm text-muted-foreground">
              Configure how your CSV headers should be processed and which rows to skip.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="headerRows">
                Header Rows
                <span className="ml-1 text-xs text-muted-foreground">
                  (Which rows contain your headers?)
                </span>
              </Label>
              <Input
                id="headerRows"
                type="number"
                min="1"
                max={totalRows ? totalRows - 1 : 10}
                value={localConfig.headerRows}
                onChange={(e) => handleHeaderRowsChange(parseInt(e.target.value) || 1)}
                className={cn(error && "border-destructive")}
              />
              <p className="text-xs text-muted-foreground">
                If your CSV has multiple header rows (e.g., main categories and subcategories), 
                increase this number. The last header row will be used as field names.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Skip Rows Configuration</Label>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="skipType">Skip Condition</Label>
                    <Select
                      value={skipCondition.type}
                      onValueChange={(value) => {
                        const newCondition = { type: value as SkipCondition['type'], value: '' };
                        handleSkipConditionChange(newCondition);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">Skip Empty Rows</SelectItem>
                        <SelectItem value="number">Skip Number of Rows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {skipCondition.type === 'number' && (
                    <div className="flex-1">
                      <Label htmlFor="skipValue">Number of Rows</Label>
                      <Input
                        id="skipValue"
                        type="number"
                        min="0"
                        max={totalRows ? totalRows - config.headerRows - 1 : 10}
                        value={skipCondition.value || ''}
                        onChange={(e) => {
                          const newCondition = { ...skipCondition, value: e.target.value };
                          handleSkipConditionChange(newCondition);
                        }}
                        placeholder="e.g., 1"
                      />
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {skipCondition.type === 'empty' && 
                    "Skip any empty rows in the CSV"
                  }
                  {skipCondition.type === 'number' && 
                    "Skip a specific number of rows after headers"
                  }
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}