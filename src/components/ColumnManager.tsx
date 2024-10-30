import { useState, useEffect, useRef } from 'react';
import { ColumnConfig } from '../types/index';
import { Settings, MoreHorizontal, Trash, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnManagerProps {
  headers: string[];
  columnConfig: Record<string, ColumnConfig>;
  onConfigChange: (config: Record<string, ColumnConfig>) => void;
}

const ColumnManager = ({ headers, columnConfig, onConfigChange }: ColumnManagerProps): JSX.Element => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<ColumnConfig>>>({});
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [editingDefault, setEditingDefault] = useState<string | null>(null);

  // Add ref for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    basic: null,
    metafields: null,
    options: null,
    variants: null
  });

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
          injectIntoVariants: false,
          variantFieldName: ''
        };
      }
    });

    if (hasChanges) {
      onConfigChange(newConfig);
    }
  }, [headers, columnConfig, onConfigChange]);

  const handleConfigChange = (header: string, changes: Partial<ColumnConfig>) => {
    // If it's a conversion option change, store it as pending
    if (changes.isMetafield || changes.isOption || changes.injectIntoVariants) {
      const newPendingChanges = {
        ...pendingChanges,
        [header]: {
          ...(pendingChanges[header] || {}),
          ...changes,
          isMetafield: changes.isMetafield || false,
          isOption: changes.isOption || false,
          injectIntoVariants: changes.injectIntoVariants || false,
          ...(changes.injectIntoVariants && {
            variantFieldName: columnConfig[header].mappedName
          })
        }
      };

      setPendingChanges(newPendingChanges);

      // Determine which section it will move to
      const pendingGroup = getGroup({
        ...columnConfig[header],
        ...newPendingChanges[header]
      });

      // Scroll to the target section after a brief delay to let the UI update
      setTimeout(() => {
        const targetSection = sectionRefs.current[pendingGroup];
        if (targetSection) {
          targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      // For non-conversion changes (like include/mappedName), apply immediately
      onConfigChange({
        ...columnConfig,
        [header]: {
          ...columnConfig[header],
          ...changes
        }
      });
    }
  };

  const handlePopoverOpenChange = (header: string, open: boolean) => {
    setOpenPopovers(prev => ({ ...prev, [header]: open }));
    
    // When closing, apply any pending changes
    if (!open && pendingChanges[header]) {
      onConfigChange({
        ...columnConfig,
        [header]: {
          ...columnConfig[header],
          ...pendingChanges[header]
        }
      });
      // Clear pending changes for this header
      setPendingChanges(prev => {
        const { [header]: ignored, ...rest } = prev;  // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      });
    }
  };

  // Get the effective group for a header (including pending changes)
  const getEffectiveGroup = (header: string, config: ColumnConfig) => {
    const pending = pendingChanges[header];
    if (!pending) return getGroup(config);
    
    const effectiveConfig = { ...config, ...pending };
    return getGroup(effectiveConfig);
  };

  const getGroup = (config: ColumnConfig) => {
    if (config?.isMetafield) return 'metafields';
    if (config?.isOption) return 'options';
    if (config?.injectIntoVariants) return 'variants';
    return 'basic';
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    const newConfig = {
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
        injectIntoVariants: false,
        variantFieldName: ''
      }
    };

    onConfigChange(newConfig);
    setNewColumnName('');
    setNewColumnDefault('');
  };

  // Ensure unique headers by removing duplicates
  const allHeaders = Array.from(new Set([
    ...headers,
    ...Object.keys(columnConfig).filter(header => columnConfig[header].isCustom)
  ]));

  // Add a check to ensure header isn't empty
  const validHeaders = allHeaders.filter(header => header.trim() !== '');

  // Group headers including pending changes
  const groupedHeaders = validHeaders.reduce((acc, header) => {
    const group = getEffectiveGroup(header, columnConfig[header]);
    acc[group] = [...(acc[group] || []), header];
    return acc;
  }, {} as Record<string, string[]>);

  const handleDeleteColumn = (header: string) => {
    const newConfig = { ...columnConfig };
    delete newConfig[header];
    onConfigChange(newConfig);
  };

  const handleDefaultValueChange = (header: string, value: string) => {
    handleConfigChange(header, { defaultValue: value });
    setEditingDefault(null);
  };

  const renderColumnCard = (header: string, index: number): JSX.Element => {
    const pendingChange = pendingChanges[header];
    const currentGroup = getGroup(columnConfig[header]);
    const pendingGroup = pendingChange ? getGroup({ ...columnConfig[header], ...pendingChange }) : currentGroup;
    const isMoving = currentGroup !== pendingGroup;

    return (
      <Card 
        key={`${header}-${index}`} 
        className={cn(
          "bg-white transition-all duration-200 cursor-pointer",
          isMoving && "border-primary/50 bg-primary/5"
        )}
        onClick={(e) => {
          // Don't toggle if clicking on the settings button, name label, or input
          if (
            e.target instanceof HTMLElement && 
            (e.target.closest('button') || 
             e.target.closest('label') || 
             e.target.closest('input'))
          ) {
            return;
          }
          handleConfigChange(header, { include: !columnConfig[header]?.include });
        }}
      >
        <CardContent className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                id={`include-${header}-${index}`}
                checked={columnConfig[header]?.include ?? true}
                onCheckedChange={(checked) => {
                  handleConfigChange(header, { include: checked as boolean });
                }}
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
              />
              {editingName === header ? (
                <Input
                  autoFocus
                  value={columnConfig[header]?.mappedName || header}
                  onChange={(e) => handleConfigChange(header, { mappedName: e.target.value })}
                  onBlur={() => setEditingName(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingName(null);
                    if (e.key === 'Escape') {
                      handleConfigChange(header, { mappedName: header });
                      setEditingName(null);
                    }
                  }}
                  className="h-8 px-2"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking input
                />
              ) : (
                <Label 
                  htmlFor={`include-${header}-${index}`}
                  className="font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent card click when clicking label
                    setEditingName(header);
                  }}
                >
                  {columnConfig[header]?.mappedName || header}
                </Label>
              )}
            </div>

            <div className="flex items-center gap-2">
              {columnConfig[header]?.include && (
                <div className="flex items-center gap-2">
                  {/* Show both gear icon and more options for custom columns */}
                  <Popover 
                    open={openPopovers[header]} 
                    onOpenChange={(open) => handlePopoverOpenChange(header, open)}
                  >
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "px-2",
                          isMoving && "text-primary"
                        )}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Conversion Options</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure how this field should be converted
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`metafield-${header}-${index}`}
                              checked={(pendingChanges[header]?.isMetafield ?? columnConfig[header]?.isMetafield) ?? false}
                              onCheckedChange={(checked) => 
                                handleConfigChange(header, { isMetafield: checked as boolean })
                              }
                            />
                            <Label htmlFor={`metafield-${header}-${index}`}>Convert to Metafield</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`option-${header}-${index}`}
                              checked={columnConfig[header]?.isOption ?? false}
                              onCheckedChange={(checked) => 
                                handleConfigChange(header, { isOption: checked as boolean })
                              }
                            />
                            <Label htmlFor={`option-${header}-${index}`}>Convert to Option</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`variants-${header}-${index}`}
                              checked={columnConfig[header]?.injectIntoVariants ?? false}
                              onCheckedChange={(checked) => 
                                handleConfigChange(header, { injectIntoVariants: checked as boolean })
                              }
                            />
                            <Label htmlFor={`variants-${header}-${index}`}>Insert into Variants</Label>
                          </div>
                        </div>

                        {/* Show additional settings based on both current and pending state */}
                        {((pendingChanges[header]?.isMetafield ?? columnConfig[header]?.isMetafield) || 
                          (pendingChanges[header]?.isOption ?? columnConfig[header]?.isOption) || 
                          (pendingChanges[header]?.injectIntoVariants ?? columnConfig[header]?.injectIntoVariants)) && (
                          <div className="grid gap-2 border-t pt-4">
                            {(pendingChanges[header]?.injectIntoVariants ?? columnConfig[header]?.injectIntoVariants) && (
                              <div className="grid gap-2">
                                <Label htmlFor={`variant-field-${header}-${index}`}>Variant field name:</Label>
                                <Input
                                  id={`variant-field-${header}-${index}`}
                                  value={pendingChanges[header]?.variantFieldName ?? columnConfig[header]?.variantFieldName ?? columnConfig[header]?.mappedName}
                                  onChange={(e) => handleConfigChange(header, { variantFieldName: e.target.value })}
                                  placeholder={columnConfig[header]?.mappedName}
                                />
                              </div>
                            )}

                            {(pendingChanges[header]?.isMetafield ?? columnConfig[header]?.isMetafield) && (
                              <div className="grid gap-2">
                                <Label htmlFor={`metafield-type-${header}-${index}`}>Type:</Label>
                                <Select
                                  value={pendingChanges[header]?.metafieldType ?? columnConfig[header]?.metafieldType ?? 'single_line_text_field'}
                                  onValueChange={(value) => handleConfigChange(header, { metafieldType: value })}
                                >
                                  <SelectTrigger id={`metafield-type-${header}-${index}`}>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single_line_text_field">Text</SelectItem>
                                    <SelectItem value="number_integer">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Label htmlFor={`namespace-${header}-${index}`}>Namespace:</Label>
                                <Input
                                  id={`namespace-${header}-${index}`}
                                  value={pendingChanges[header]?.metafieldNamespace ?? columnConfig[header]?.metafieldNamespace ?? 'custom'}
                                  onChange={(e) => handleConfigChange(header, { metafieldNamespace: e.target.value })}
                                />
                              </div>
                            )}

                            {(pendingChanges[header]?.isOption ?? columnConfig[header]?.isOption) && (
                              <div className="grid gap-2">
                                <Label htmlFor={`separator-${header}-${index}`}>Value separator:</Label>
                                <Input
                                  id={`separator-${header}-${index}`}
                                  value={pendingChanges[header]?.optionSeparator ?? columnConfig[header]?.optionSeparator ?? ','}
                                  onChange={(e) => handleConfigChange(header, { optionSeparator: e.target.value })}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {columnConfig[header]?.isCustom && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            setEditingDefault(header);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Default Value
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleDeleteColumn(header);
                          }}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                          Delete Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {editingDefault === header && (
                    <Popover 
                      open={true} 
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingDefault(null);
                        }
                      }}
                    >
                      <PopoverContent 
                        className="w-80" 
                        align="end" 
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                      >
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Edit Default Value</h4>
                            <p className="text-sm text-muted-foreground">
                              Set the default value for this custom column
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`default-${header}`}>Default Value</Label>
                            <Input
                              id={`default-${header}`}
                              defaultValue={columnConfig[header]?.defaultValue}
                              onKeyDown={(e) => {
                                e.stopPropagation(); // Prevent card click
                                if (e.key === 'Enter') {
                                  handleDefaultValueChange(header, e.currentTarget.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingDefault(null);
                                }
                              }}
                              onBlur={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleDefaultValueChange(header, e.target.value);
                              }}
                              placeholder="Enter default value"
                              autoFocus
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Column Configuration
      </h3>

      {/* Add Custom Column Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Add Custom Column</h4>
            <p className="text-sm text-muted-foreground">
              Create a custom column to add static values to your JSON output. 
              You can also convert these custom columns to metafields, options, or variant fields.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="columnName">Column Name</Label>
              <Input
                id="columnName"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColumn();
                  }
                }}
                placeholder="Enter column name"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This will be the field name in your JSON output
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                value={newColumnDefault}
                onChange={(e) => setNewColumnDefault(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColumn();
                  }
                }}
                placeholder="Enter default value"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This value will be added to all rows in your JSON output
              </p>
            </div>
          </div>
          <Button 
            onClick={handleAddColumn}
            className="mt-4"
            disabled={!newColumnName.trim()}
          >
            Add Custom Column
          </Button>
        </CardContent>
      </Card>

      {/* Column Grid */}
      <div className="space-y-6">
        {Object.entries(groupedHeaders).map(([group, groupHeaders]) => (
          <div 
            key={group} 
            className="space-y-4"
            ref={el => sectionRefs.current[group] = el}
          >
            <h4 className="text-sm font-medium capitalize text-muted-foreground flex items-center gap-2">
              <span>
                {group === 'basic' ? 'Basic Fields' : 
                 group === 'metafields' ? 'Metafields' : 
                 group === 'options' ? 'Option Fields' : 
                 'Variant Fields'}
              </span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {groupHeaders.length}
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupHeaders.map((header, index) => renderColumnCard(header, index))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColumnManager;