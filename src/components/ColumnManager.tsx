import { useState, useEffect, isValidElement } from 'react';
import { ColumnConfig } from '../types/index';
import { Settings, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface ColumnManagerProps {
  headers: string[];
  columnConfig: Record<string, ColumnConfig>;
  onConfigChange: (config: Record<string, ColumnConfig>) => void;
}

interface DraggableColumnCardProps {
  header: string;
  index: number;
  columnConfig: Record<string, ColumnConfig>;
  pendingChanges: Record<string, Partial<ColumnConfig>>;
  isDragging?: boolean;
  onConfigChange: (header: string, changes: Partial<ColumnConfig>) => void;
  onEditName: (header: string | null) => void;
  editingName: string | null;
}

const getGroup = (config: ColumnConfig) => {
  if (config?.isMetafield) return 'metafields';
  if (config?.isOption) return 'options';
  if (config?.injectIntoVariants) return 'variants';
  return 'basic';
};

const DraggableColumnCard = ({ 
  header,
  index,
  columnConfig,
  pendingChanges,
  isDragging,
  onConfigChange,
  onEditName,
  editingName,
}: DraggableColumnCardProps) => {
  const dragId = header === '' ? '_BLANK_' : header;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: dragId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pendingChange = pendingChanges[header];
  const currentGroup = getGroup(columnConfig[header]);
  const pendingGroup = pendingChange ? getGroup({ ...columnConfig[header], ...pendingChange }) : currentGroup;
  const isMoving = currentGroup !== pendingGroup;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "z-50"
      )}
    >
      <Card 
        className={cn(
          "bg-white transition-all duration-200",
          isDragging && "opacity-50",
          isMoving && "border-primary/50 bg-primary/5"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div 
              {...attributes}
              {...listeners}
              className="absolute left-2 top-0 bottom-0 flex items-center cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>

            <div className="flex items-center gap-2 pl-6">
              <Checkbox
                id={`include-${header}-${index}`}
                checked={columnConfig[header]?.include ?? true}
                onCheckedChange={(checked) => {
                  onConfigChange(header, { include: checked as boolean });
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {editingName === header ? (
                <Input
                  autoFocus
                  value={columnConfig[header]?.mappedName || (header.trim() === '' ? 'BLANK' : header)}
                  onChange={(e) => onConfigChange(header, { mappedName: e.target.value })}
                  onBlur={() => onEditName(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onEditName(null);
                    if (e.key === 'Escape') {
                      onConfigChange(header, { mappedName: header.trim() === '' ? 'BLANK' : header });
                      onEditName(null);
                    }
                  }}
                  className="h-8 px-2"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Label 
                  htmlFor={`include-${header}-${index}`}
                  className="font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditName(header);
                  }}
                >
                  {columnConfig[header]?.mappedName || (header.trim() === '' ? 'BLANK' : header)}
                </Label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create a new DroppableSection component
const DroppableSection = ({ 
  group, 
  title, 
  children, 
  isDragOver,
  isEmpty 
}: { 
  group: string; 
  title: string; 
  children: React.ReactNode;
  isDragOver: boolean;
  isEmpty: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: group
  });

  // Calculate count from children
  const getChildrenCount = () => {
    if (isEmpty) return 0;
    
    // If children is an array, return its length
    if (Array.isArray(children)) {
      return children.length;
    }
    
    // If children is a single element, return 1
    if (isValidElement(children)) {
      return 1;
    }
    
    return 0;
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "space-y-4 p-4 rounded-lg transition-colors",
        isDragOver && "bg-primary/5 border-2 border-dashed border-primary",
        isEmpty && "bg-muted/5"
      )}
      data-group={group}
    >
      <h4 className="text-sm font-medium capitalize text-muted-foreground flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">
          {getChildrenCount()}
        </span>
      </h4>
      {children}
    </div>
  );
};

// Add the normalizeKey function (same as in converter.ts)
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[\s-/]+/g, '_') // Replace spaces, hyphens, and forward slashes with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove any other special characters
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

const ColumnManager = ({ headers, columnConfig, onConfigChange }: ColumnManagerProps): JSX.Element => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<ColumnConfig>>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // Then update handleConfigChange to normalize mappedName
  const handleConfigChange = (header: string, changes: Partial<ColumnConfig>) => {
    // If we're changing the mappedName, normalize it
    if ('mappedName' in changes) {
      changes.mappedName = normalizeKey(changes.mappedName || header);
    }

    // If it's a conversion option change, store it as pending
    if ('isMetafield' in changes || 'isOption' in changes || 'injectIntoVariants' in changes) {
      const newPendingChanges = {
        ...pendingChanges,
        [header]: {
          ...(pendingChanges[header] || {}),
          ...changes
        }
      };
      setPendingChanges(newPendingChanges);

      // Apply changes immediately
      onConfigChange({
        ...columnConfig,
        [header]: {
          ...columnConfig[header],
          ...changes
        }
      });
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

  // Also update handleAddColumn to normalize the new column name
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    const normalizedName = normalizeKey(newColumnName);

    const newConfig = {
      ...columnConfig,
      [newColumnName]: {
        originalName: newColumnName,
        mappedName: normalizedName,
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

  // Ensure unique headers by removing duplicates, but preserve empty headers
  const allHeaders = Array.from(new Set([
    ...headers,
    ...Object.keys(columnConfig).filter(header => columnConfig[header].isCustom)
  ]));

  // Map empty headers to BLANK but keep the original empty string as the key
  const effectiveHeaders = allHeaders.map(header => ({
    original: header,
    display: header.trim() === '' ? 'BLANK' : header
  }));

  const getEffectiveGroup = (header: string, config: ColumnConfig) => {
    const pendingChange = pendingChanges[header];
    if (!pendingChange) return getGroup(config);
    return getGroup({ ...config, ...pendingChange });
  };

  // Group headers including pending changes
  const groupedHeaders = effectiveHeaders.reduce((acc, { original }) => {
    const group = getEffectiveGroup(original, columnConfig[original]);
    acc[group] = [...(acc[group] || []), original];
    return acc;
  }, {} as Record<string, string[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id === '_BLANK_' ? '' : id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const container = event.over?.id as string;
    if (container && ['basic', 'metafields', 'options', 'variants'].includes(container)) {
      setDragOverGroup(container);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const container = dragOverGroup;
    const draggedId = event.active.id as string;
    const actualId = draggedId === '_BLANK_' ? '' : draggedId;

    if (container && draggedId) {
      let changes: Partial<ColumnConfig> = {};
      
      // Reset all conversion flags
      changes = {
        isMetafield: false,
        isOption: false,
        injectIntoVariants: false,
      };

      // Set the appropriate flag based on the target container
      switch (container) {
        case 'metafields':
          changes.isMetafield = true;
          changes.metafieldNamespace = 'custom';
          changes.metafieldType = 'single_line_text_field';
          break;
        case 'options':
          changes.isOption = true;
          changes.optionSeparator = ',';
          break;
        case 'variants':
          changes.injectIntoVariants = true;
          changes.variantFieldName = columnConfig[actualId].mappedName;
          break;
      }

      handleConfigChange(actualId, changes);
    }

    setActiveId(null);
    setDragOverGroup(null);
  };

  // Add this constant at the top level
  const GROUPS = {
    basic: 'Basic Fields',
    metafields: 'Metafields',
    options: 'Option Fields',
    variants: 'Variant Fields'
  } as const;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
          {Object.entries(GROUPS).map(([group, title]) => (
            <DroppableSection
              key={group}
              group={group}
              title={title}
              isDragOver={dragOverGroup === group}
              isEmpty={!groupedHeaders[group]?.length}
            >
              {groupedHeaders[group]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedHeaders[group].map((header, index) => (
                    <DraggableColumnCard
                      key={header}
                      header={header}
                      index={index}
                      columnConfig={columnConfig}
                      pendingChanges={pendingChanges}
                      isDragging={activeId === header}
                      onConfigChange={handleConfigChange}
                      onEditName={setEditingName}
                      editingName={editingName}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  Drag fields here to convert them to {title.toLowerCase()}
                </div>
              )}
            </DroppableSection>
          ))}
        </div>
      </div>

      {/* Add drag overlay */}
      <DragOverlay>
        {activeId ? (
          <Card className="bg-white shadow-lg opacity-80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Label className="font-medium">
                  {columnConfig[activeId]?.mappedName || 
                   (activeId.trim() === '' ? 'BLANK' : activeId)}
                </Label>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default ColumnManager;