import { useState } from 'react';
import { ColumnConfig } from '../types/index';
import { Settings, ArrowRight, Plus } from 'lucide-react';

interface ColumnManagerProps {
  headers: string[];
  columnConfig: Record<string, ColumnConfig>;
  onConfigChange: (config: Record<string, ColumnConfig>) => void;
}

export default function ColumnManager({ headers, columnConfig, onConfigChange }: ColumnManagerProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');

  const handleConfigChange = (header: string, changes: Partial<ColumnConfig>) => {
    onConfigChange({
      ...columnConfig,
      [header]: {
        ...columnConfig[header],
        ...changes
      }
    });
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

      <div className="bg-gray-50 p-4 rounded-lg border mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Column</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Column Name</label>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Enter column name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Default Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColumnDefault}
                onChange={(e) => setNewColumnDefault(e.target.value)}
                placeholder="Enter default value"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleAddColumn}
                className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allHeaders.map((header, index) => (
          <div key={`column-${header}-${index}`} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={columnConfig[header]?.include ?? true}
                    onChange={(e) => handleConfigChange(header, { include: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="font-medium">{header}</span>
                </label>
              </div>

              {columnConfig[header]?.include && (
                <div className="space-y-3 pl-6">
                  <div>
                    <label className="block text-sm text-gray-600">
                      Map to name:
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{header}</span>
                        <ArrowRight className="w-4 h-4" />
                        <input
                          type="text"
                          value={columnConfig[header]?.mappedName || ''}
                          onChange={(e) => handleConfigChange(header, { mappedName: e.target.value })}
                          placeholder={header}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={columnConfig[header]?.isMetafield ?? false}
                        onChange={(e) => handleConfigChange(header, { isMetafield: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Convert to Metafield</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={columnConfig[header]?.isOption ?? false}
                        onChange={(e) => handleConfigChange(header, { isOption: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Convert to Option</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={columnConfig[header]?.injectIntoVariants ?? false}
                        onChange={(e) => handleConfigChange(header, { injectIntoVariants: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Insert into Variants</span>
                    </label>

                    {columnConfig[header]?.injectIntoVariants && (
                      <div className="pl-6">
                        <label className="block text-sm text-gray-600">
                          Variant field name:
                          <input
                            type="text"
                            value={columnConfig[header]?.variantFieldName || ''}
                            onChange={(e) => handleConfigChange(header, { variantFieldName: e.target.value })}
                            placeholder={header}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </label>
                      </div>
                    )}

                    {columnConfig[header]?.isMetafield && (
                      <div className="pl-6 space-y-2">
                        <label className="block text-sm text-gray-600">
                          Type:
                          <select
                            value={columnConfig[header]?.metafieldType || 'single_line_text_field'}
                            onChange={(e) => handleConfigChange(header, { metafieldType: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          >
                            <option value="single_line_text_field">Text</option>
                            <option value="number_integer">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="date">Date</option>
                          </select>
                        </label>

                        <label className="block text-sm text-gray-600">
                          Namespace:
                          <input
                            type="text"
                            value={columnConfig[header]?.metafieldNamespace || 'custom'}
                            onChange={(e) => handleConfigChange(header, { metafieldNamespace: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </label>
                      </div>
                    )}

                    {columnConfig[header]?.isOption && (
                      <div className="pl-6">
                        <label className="block text-sm text-gray-600">
                          Value separator:
                          <input
                            type="text"
                            value={columnConfig[header]?.optionSeparator || ','}
                            onChange={(e) => handleConfigChange(header, { optionSeparator: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}