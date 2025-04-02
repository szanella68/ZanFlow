// FILE: PropertiesPanel.js
import React, { useState, useEffect } from 'react';
import './Panels.css';

const PropertiesPanel = ({ selectedObject, onUpdate }) => {
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (selectedObject && selectedObject.data) {
      try {
        const parsed = typeof selectedObject.data === 'string'
          ? JSON.parse(selectedObject.data)
          : selectedObject.data;
        setProperties(parsed);
      } catch (err) {
        console.error('❌ Errore nel parsing dei dati del nodo:', err);
        setProperties({});
      }
    } else {
      setProperties({});
    }
  }, [selectedObject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...properties, [name]: value };
    setProperties(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  if (!selectedObject) {
    return (
      <div className="panel properties-panel">
        <h3>Proprietà</h3>
        <p>Nessun oggetto selezionato.</p>
      </div>
    );
  }

  return (
    <div className="panel properties-panel">
      <h3>Proprietà</h3>
      {Object.keys(properties).map((key) => (
        <div key={key} className="property-row">
          <label>{key}</label>
          <input
            type="text"
            name={key}
            value={properties[key]}
            onChange={handleChange}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertiesPanel;