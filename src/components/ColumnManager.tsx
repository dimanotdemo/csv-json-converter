import { useState, useEffect } from 'react';
import { ColumnConfig } from '../types/index';
import { Settings, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ColumnManagerProps {
  headers: string[];
  columnConfig: Record<string, ColumnConfig>;
  onConfigChange: (config: Record<string, ColumnConfig>) => void;
}

export default function ColumnManager({ headers, columnConfig, onConfigChange }: ColumnManagerProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');

  // Initialize column config for new headers
  useEffect(() => {
    const newConfig = { ...columnConfig };
    let hasChanges = false;

    headers.forEach(header => {
      if (!newConfig[header]) {
        hasChanges = true;
        newConfig[header] = {
          originalName: header,
          mappedName: header,
          include: true,
          isMetafield: false,
          metafieldNamespace: 'custom',
          metafieldType: 'single_line_text_field',
          isOption: false,
          optionSeparator: ',',
          injectIntoVariants: false
        };
      }
    });

    if (hasChanges) {
      onConfigChange(newConfig);
    }
  }, [headers, columnConfig, onConfigChange]);

  const handleConfigChange = (header: string, changes: Partial<ColumnConfig>) => {
    const updatedConfig = {
      ...columnConfig,
      [header]: {
        ...columnConfig[header],
        ...changes
      }
    };
    onConfigChange(updatedConfig);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    onConfigChange({
      ...columnConfig,
      [newColumnName]: {
        originalName: newColumnName,
        mappedName: newColumnName,
        include: true,
        isCustom: true,
        defaultValue: newColumnDefault,
        isMetafield: false,
        metafieldNamespace: 'custom',
        metafieldType: 'single_line_text_field',
        isOption: false,
        optionSeparator: ',',
        injectIntoVariants: false
      }
    });

    setNewColumnName('');
    setNewColumnDefault('');
  };

  const allHeaders = [
    ...headers,
    ...Object.keys(columnConfig).filter(header => columnConfig[header].isCustom)
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Column Configuration
      </h3>

      <Card>
        <CardHeader className="pb-3">
          <h4 className="text-sm font-medium">Add Custom Column</h4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="columnName">Column Name</Label>
              <Input
                id="columnName"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value</Label>
              <div className="flex gap-2">
                <Input
                  id="defaultValue"
                  value={newColumnDefault}
                  onChange={(e) => setNewColumnDefault(e.target.value)}
                  placeholder="Enter default value"
                />
                <Button onClick={handleAddColumn} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allHeaders.map((header) => (
          <Card key={header}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`include-${header}`}
                    checked={columnConfig[header]?.include ?? true}
                    onCheckedChange={(checked) => 
                      handleConfigChange(header, { include: checked as boolean })
                    }
                  />
                  <Label htmlFor={`include-${header}`}>{header}</Label>
                </div>

                {columnConfig[header]?.include && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor={`mapped-${header}`}>Map to name:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{header}</span>
                        <ArrowRight className="w-4 h-4" />
                        <Input
                          id={`mapped-${header}`}
                          value={columnConfig[header]?.mappedName || ''}
                          onChange={(e) => handleConfigChange(header, { mappedName: e.target.value })}
                          placeholder={header}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`metafield-${header}`}
                          checked={columnConfig[header]?.isMetafield ?? false}
                          onCheckedChange={(checked) => 
                            handleConfigChange(header, { isMetafield: checked as boolean })
                          }
                        />
                        <Label htmlFor={`metafield-${header}`}>Convert to Metafield</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${header}`}
                          checked={columnConfig[header]?.isOption ?? false}
                          onCheckedChange={(checked) => 
                            handleConfigChange(header, { isOption: checked as boolean })
                          }
                        />
                        <Label htmlFor={`option-${header}`}>Convert to Option</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`variants-${header}`}
                          checked={columnConfig[header]?.injectIntoVariants ?? false}
                          onCheckedChange={(checked) => 
                            handleConfigChange(header, { injectIntoVariants: checked as boolean })
                          }
                        />
                        <Label htmlFor={`variants-${header}`}>Insert into Variants</Label>
                      </div>

                      {columnConfig[header]?.injectIntoVariants && (
                        <div className="pl-6 space-y-2">
                          <Label htmlFor={`variant-field-${header}`}>Variant field name:</Label>
                          <Input
                            id={`variant-field-${header}`}
                            value={columnConfig[header]?.variantFieldName || ''}
                            onChange={(e) => handleConfigChange(header, { variantFieldName: e.target.value })}
                            placeholder={header}
                          />
                        </div>
                      )}

                      {columnConfig[header]?.isMetafield && (
                        <div className="pl-6 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`metafield-type-${header}`}>Type:</Label>
                            <Select
                              value={columnConfig[header]?.metafieldType || 'single_line_text_field'}
                              onValueChange={(value) => handleConfigChange(header, { metafieldType: value })}
                            >
                              <SelectTrigger id={`metafield-type-${header}`}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single_line_text_field">Text</SelectItem>
                                <SelectItem value="number_integer">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`namespace-${header}`}>Namespace:</Label>
                            <Input
                              id={`namespace-${header}`}
                              value={columnConfig[header]?.metafieldNamespace || 'custom'}
                              onChange={(e) => handleConfigChange(header, { metafieldNamespace: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {columnConfig[header]?.isOption && (
                        <div className="pl-6 space-y-2">
                          <Label htmlFor={`separator-${header}`}>Value separator:</Label>
                          <Input
                            id={`separator-${header}`}
                            value={columnConfig[header]?.optionSeparator || ','}
                            onChange={(e) => handleConfigChange(header, { optionSeparator: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}