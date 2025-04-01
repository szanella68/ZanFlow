import React from 'react';
import './Panels.css';

const PropertiesPanel = () => {
  return (
    <div className="panel properties-panel">
      <h3>Proprietà</h3>
      <div className="property-group">
        <label>Nome:</label>
        <input type="text" placeholder="Nome elemento" />
      </div>
      <div className="property-group">
        <label>Tempo ciclo (s):</label>
        <input type="number" placeholder="0" min="0" step="0.1" />
      </div>
      <div className="property-group">
        <label>Pezzi/ora:</label>
        <input type="number" placeholder="0" min="0" />
      </div>
      <div className="property-group">
        <label>Operatori:</label>
        <input type="number" placeholder="0" min="0" />
      </div>
      <div className="property-group">
        <label>Scarto (%):</label>
        <input type="number" placeholder="0" min="0" max="100" step="0.1" />
      </div>
      <button className="apply-button">Applica</button>
    </div>
  );
};

export default PropertiesPanel;