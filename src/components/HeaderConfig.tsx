import { Layout } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderConfig {
  headerRows: number;
  skipRows: number;
  hierarchical: boolean;
}

interface HeaderConfigProps {
  config: HeaderConfig;
  onConfigChange: (config: HeaderConfig) => void;
}

export default function HeaderConfigPanel({ config, onConfigChange }: HeaderConfigProps) {
  const handleHeaderRowsChange = (value: number) => {
    const newValue = Math.max(1, value);
    onConfigChange({
      ...config,
      headerRows: newValue,
      skipRows: Math.min(config.skipRows, Math.max(0, 10 - newValue))
    });
  };

  const handleSkipRowsChange = (value: number) => {
    onConfigChange({
      ...config,
      skipRows: Math.max(0, value)
    });
  };

  return (
    <>
      <h3 className="text-lg font-semibold flex items-center gap-2">
      <Layout className="w-5 h-5" />
        Header Configuration
      </h3>
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium">Configure Header Rows</h4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="headerRows">
                Header Rows
                <span className="ml-1 text-xs text-muted-foreground">
                  (Which row contains your headers?)
                </span>
              </Label>
              <Input
                id="headerRows"
                type="number"
                min="1"
                max="10"
                value={config.headerRows}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleHeaderRowsChange(parseInt(e.target.value) || 1)
                }
              />
              <p className="text-xs text-muted-foreground">
                Select how many rows contain headers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skipRows">
                Skip Rows
                <span className="ml-1 text-xs text-muted-foreground">
                  (Additional rows to skip after headers)
                </span>
              </Label>
              <Input
                id="skipRows"
                type="number"
                min="0"
                value={config.skipRows}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleSkipRowsChange(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                Skip additional rows after the headers before data starts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headerStructure">Header Structure</Label>
              <Select
                value={config.hierarchical ? "hierarchical" : "flat"}
                onValueChange={(value: string) =>
                  onConfigChange({
                    ...config,
                    hierarchical: value === "hierarchical",
                  })
                }
              >
                <SelectTrigger id="headerStructure">
                  <SelectValue placeholder="Select header structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Headers</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical Headers</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how to handle multi-row headers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}