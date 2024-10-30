import React from 'react';
import { HeaderConfig } from '../types';
import { Layout } from 'lucide-react';

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
      // Reset skip rows if it would result in skipping all data
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Layout className="w-5 h-5" />
        Header Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Header Rows
            <span className="ml-1 text-xs text-gray-500">
              (Which row contains your headers?)
            </span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.headerRows}
            onChange={(e) => handleHeaderRowsChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-500">
            Select how many rows contain headers
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Skip Rows
            <span className="ml-1 text-xs text-gray-500">
              (Additional rows to skip after headers)
            </span>
          </label>
          <input
            type="number"
            min="0"
            value={config.skipRows}
            onChange={(e) => handleSkipRowsChange(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-500">
            Skip additional rows after the headers before data starts
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Header Structure
          </label>
          <select
            value={config.hierarchical ? "hierarchical" : "flat"}
            onChange={(e) =>
              onConfigChange({
                ...config,
                hierarchical: e.target.value === "hierarchical",
              })
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="flat">Flat Headers</option>
            <option value="hierarchical">Hierarchical Headers</option>
          </select>
          <p className="text-xs text-gray-500">
            Choose how to handle multi-row headers
          </p>
        </div>
      </div>
    </div>
  );
}