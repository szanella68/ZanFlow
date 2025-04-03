// FILE: PropertiesPanel.js
import React, { useState, useEffect } from 'react';
import './Panels.css';

// Funzione di utilità per formattare il nome delle proprietà
const formatPropertyName = (name) => {
  const translations = {
    // Proprietà comuni
    name: 'Nome',
    cycleTime: 'Tempo ciclo (s)',
    piecesPerHour: 'Pezzi/ora',
    operators: 'Operatori',
    rejectRate: 'Scarto (%)',
    
    // Proprietà specifiche per macchine
    throughputTime: 'Tempo attraversamento (s)',
    supplier: 'Fornitore',
    hourlyCost: 'Costo orario (€)',
    availability: 'Disponibilità (%)',
    
    // Proprietà specifiche per trasporti
    transportType: 'Tipo trasporto',
    distance: 'Distanza (m)',
    minBatch: 'Batch minimo',
    
    // Proprietà specifiche per magazzini
    capacity: 'Capacità',
    averageStayTime: 'Tempo medio permanenza (h)',
    managementMethod: 'Metodo gestione',
    storageCost: 'Costo stoccaggio (€/h)'
  };
  
  return translations[name] || name;
};

const PropertiesPanel = ({ selectedObject, onUpdate }) => {
  const [properties, setProperties] = useState({});
  const [objectType, setObjectType] = useState(null);

  useEffect(() => {
    if (selectedObject) {
      try {
        console.log('Oggetto selezionato:', selectedObject);
        setObjectType(selectedObject.objectType || null);
        
        let data;
        if (selectedObject.data) {
          data = typeof selectedObject.data === 'string'
            ? JSON.parse(selectedObject.data)
            : selectedObject.data;
        } else {
          data = {};
        }
        
        setProperties(data);
      } catch (err) {
        console.error('❌ Errore nel parsing dei dati del nodo:', err);
        setProperties({});
        setObjectType(null);
      }
    } else {
      setProperties({});
      setObjectType(null);
    }
  }, [selectedObject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Converti i valori numerici se necessario
    if (
      name === 'cycleTime' || 
      name === 'piecesPerHour' || 
      name === 'operators' || 
      name === 'rejectRate' ||
      name === 'throughputTime' ||
      name === 'hourlyCost' ||
      name === 'availability' ||
      name === 'distance' ||
      name === 'minBatch' ||
      name === 'capacity' ||
      name === 'averageStayTime' ||
      name === 'storageCost'
    ) {
      processedValue = value === '' ? 0 : Number(value);
    }
    
    const updated = { ...properties, [name]: processedValue };
    setProperties(updated);
    
    if (onUpdate) {
      // Clona l'oggetto per evitare modifiche inattese
      const updatedData = { ...updated };
      onUpdate(updatedData);
    }
  };

  const getObjectTypeTitle = () => {
    switch (objectType) {
      case 'machine': return 'Macchina';
      case 'transport': return 'Trasporto';
      case 'storage': return 'Magazzino';
      default: return 'Oggetto';
    }
  };

  if (!selectedObject) {
    return (
      <div className="panel properties-panel">
        <h3>Proprietà</h3>
        <p>Nessun oggetto selezionato.</p>
        <p className="help-text">Seleziona un elemento sul canvas o trascina un nuovo elemento dal pannello strumenti.</p>
      </div>
    );
  }

  return (
    <div className="panel properties-panel">
      <h3>Proprietà {getObjectTypeTitle()}</h3>
      
      {Object.keys(properties).map((key) => (
        <div key={key} className="property-row">
          <label>{formatPropertyName(key)}</label>
          <input
            type="text"
            name={key}
            value={properties[key]}
            onChange={handleChange}
          />
        </div>
      ))}
      
      <div className="panel-footer">
        <p className="object-info">
          ID: {selectedObject.id || 'Non salvato'}
        </p>
      </div>
    </div>
  );
};

export default PropertiesPanel;