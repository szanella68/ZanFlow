import React from 'react';
import './Panels.css';

const ToolsPanel = ({ onSelectTool }) => {
  const handleDragStart = (event, toolType) => {
    event.dataTransfer.setData('toolType', toolType);
  };

  const handleToolClick = (toolType) => {
    console.log('Tool clicked:', toolType); // Debug log
    onSelectTool(toolType);
  };

  return (
    <div className="panel tools-panel">
      <h3>Strumenti</h3>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'machine')}
          onClick={() => handleToolClick('machine')}
        >
          Macchina
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'transport')}
          onClick={() => handleToolClick('transport')}
        >
          Trasporto
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'storage')}
          onClick={() => handleToolClick('storage')}
        >
          Magazzino
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'connection')}
          onClick={() => handleToolClick('connection')}
        >
          Connessione
        </button>
      </div>
    </div>
  );
};

export default ToolsPanel;