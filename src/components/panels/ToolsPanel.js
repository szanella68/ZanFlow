import React from 'react';
import './Panels.css';

const ToolsPanel = ({ onSelectTool }) => {
  const handleDragStart = (event, toolType) => {
    event.dataTransfer.setData('toolType', toolType);
  };

  return (
    <div className="panel tools-panel">
      <h3>Strumenti</h3>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'machine')}
          onClick={() => onSelectTool('machine')}
        >
          Macchina
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'transport')}
          onClick={() => onSelectTool('transport')}
        >
          Trasporto
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'storage')}
          onClick={() => onSelectTool('storage')}
        >
          Magazzino
        </button>
      </div>
      <div className="tool-item">
        <button 
          className="tool-button" 
          draggable 
          onDragStart={(e) => handleDragStart(e, 'connection')}
          onClick={() => onSelectTool('connection')}
        >
          Connessione
        </button>
      </div>
    </div>
  );
};

export default ToolsPanel;