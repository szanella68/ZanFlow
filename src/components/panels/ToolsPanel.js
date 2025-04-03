// FILE: ToolsPanel.js
import React, { useState } from 'react';
import './ToolsPanelWithIcons.css';

// Definiamo alcune icone semplici usando SVG inline
const icons = {
  machine: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="#1976d2" strokeWidth="2" fill="#d3e5ff" />
      <path d="M7 10h10M7 14h10" stroke="#1976d2" strokeWidth="1.5" />
    </svg>
  ),
  transport: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M19 12l-3-3M19 12l-3 3" stroke="#fb8c00" strokeWidth="2" />
      <rect x="5" y="8" width="6" height="8" rx="1" fill="#ffe0b2" stroke="#fb8c00" />
    </svg>
  ),
  storage: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="6" width="14" height="12" rx="2" fill="#c8e6c9" stroke="#388e3c" strokeWidth="2" />
      <path d="M7 10h10M7 14h10" stroke="#388e3c" strokeWidth="1.5" />
      <path d="M12 6v12" stroke="#388e3c" strokeWidth="1.5" />
    </svg>
  ),
  connection: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5L19 19M5 19L19 5" stroke="#9e9e9e" strokeWidth="2" />
      <circle cx="5" cy="5" r="3" fill="white" stroke="#9e9e9e" strokeWidth="1.5" />
      <circle cx="19" cy="19" r="3" fill="white" stroke="#9e9e9e" strokeWidth="1.5" />
    </svg>
  )
};

const tools = [
  { type: 'machine', label: 'Macchina', icon: icons.machine },
  { type: 'transport', label: 'Trasporto', icon: icons.transport },
  { type: 'storage', label: 'Magazzino', icon: icons.storage },
  { type: 'connection', label: 'Connessione', icon: icons.connection }
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
      {tools.map(({ type, label, icon }) => (
        <div className="tool-item" key={type}>
          <button
            className={`tool-button ${activeTool === type ? 'active' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleToolClick(type)}
          >
            <div className="tool-icon">{icon}</div>
            <span className="tool-label">{label}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToolsPanel;