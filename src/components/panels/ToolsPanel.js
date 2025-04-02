// FILE: ToolsPanel.js
import React, { useState } from 'react';
import './Panels.css';

const tools = [
  { type: 'machine', label: 'Macchina' },
  { type: 'transport', label: 'Trasporto' },
  { type: 'storage', label: 'Magazzino' },
  { type: 'connection', label: 'Connessione' }
];

const ToolsPanel = ({ onSelectTool }) => {
  const [activeTool, setActiveTool] = useState(null);

  const handleDragStart = (event, toolType) => {
    event.dataTransfer.setData('toolType', toolType);
  };

  const handleToolClick = (toolType) => {
    const newActive = activeTool === toolType ? null : toolType;
    setActiveTool(newActive);
    if (onSelectTool) {
      onSelectTool(newActive);
    }
  };

  return (
    <div className="panel tools-panel">
      <h3>Strumenti</h3>
      {tools.map(({ type, label }) => (
        <div className="tool-item" key={type}>
          <button
            className={`tool-button ${activeTool === type ? 'active' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleToolClick(type)}
          >
            {label}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToolsPanel;
