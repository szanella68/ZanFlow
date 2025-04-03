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

// Funzione per determinare il tipo di input appropriato
const getInputType = (key, value) => {
  // Campi con valori predefiniti o selezionabili
  if (key === 'transportType') {
    return 'select';
  } else if (key === 'supplier') {
    return 'select';
  } else if (key === 'managementMethod') {
    return 'select';
  }
  
  // Campi numerici
  if (
    key === 'cycleTime' || 
    key === 'piecesPerHour' || 
    key === 'operators' || 
    key === 'rejectRate' ||
    key === 'throughputTime' ||
    key === 'hourlyCost' ||
    key === 'availability' ||
    key === 'distance' ||
    key === 'minBatch' ||
    key === 'capacity' ||
    key === 'averageStayTime' ||
    key === 'storageCost'
  ) {
    return 'number';
  }
  
  // Default per campi di testo
  return 'text';
};

// Funzione per ottenere opzioni per i campi select
const getSelectOptions = (key) => {
  switch(key) {
    case 'transportType':
      return ['manuale', 'automatico', 'veicolo', 'nastro'];
    case 'supplier':
      return ['interno', 'esterno', 'misto'];
    case 'managementMethod':
      return ['FIFO', 'LIFO', 'random'];
    default:
      return [];
  }
};

const PropertiesPanel = ({ selectedObject, onUpdate }) => {
  const [properties, setProperties] = useState({});
  const [objectType, setObjectType] = useState(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

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
        
        console.log('Dati caricati:', data);
        
        // Aggiungiamo proprietà di default in base al tipo se non esistono
        const defaultProps = getDefaultPropertiesForType(selectedObject.objectType);
        const mergedData = { ...defaultProps, ...data };
        
        setProperties(mergedData);
        setNeedsSave(false);
        setSaveStatus(null);
      } catch (err) {
        console.error('❌ Errore nel parsing dei dati del nodo:', err);
        setProperties({});
        setObjectType(null);
      }
    } else {
      setProperties({});
      setObjectType(null);
      setNeedsSave(false);
      setSaveStatus(null);
    }
  }, [selectedObject]);

  // Ottiene proprietà di default in base al tipo
  const getDefaultPropertiesForType = (type) => {
    const baseProps = {
      name: type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Oggetto',
      cycleTime: 0,
      piecesPerHour: 0,
      operators: 0,
      rejectRate: 0
    };
    
    switch(type) {
      case 'machine':
        return { 
          ...baseProps, 
          throughputTime: 0, 
          supplier: 'interno', 
          hourlyCost: 0, 
          availability: 100 
        };
      case 'transport':
        return { 
          ...baseProps, 
          transportType: 'manuale', 
          throughputTime: 0, 
          distance: 0, 
          minBatch: 1 
        };
      case 'storage':
        return { 
          ...baseProps, 
          capacity: 0, 
          averageStayTime: 0, 
          managementMethod: 'FIFO', 
          storageCost: 0 
        };
      default:
        return baseProps;
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    // Converti i valori numerici se necessario
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }
    
    const updated = { ...properties, [name]: processedValue };
    setProperties(updated);
    setNeedsSave(true);
    setSaveStatus(null);
    
    console.log(`Campo modificato: ${name} = ${processedValue}`);
  };
  
  const handleSave = async () => {
    if (onUpdate && needsSave) {
      try {
        console.log('Tentativo di salvataggio con dati:', properties);
        setSaveStatus('saving');
        
        // Clona l'oggetto per evitare modifiche inattese
        const updatedData = { ...properties };
        await onUpdate(updatedData);
        
        console.log('Salvataggio completato con successo');
        setSaveStatus('success');
        setNeedsSave(false);
        
        // Reset dello stato di successo dopo 2 secondi
        setTimeout(() => {
          if (setSaveStatus) {
            setSaveStatus(null);
          }
        }, 2000);
      } catch (err) {
        console.error('Errore durante il salvataggio:', err);
        setSaveStatus('error');
      }
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

  const renderField = (key, value) => {
    const inputType = getInputType(key, value);
    
    if (inputType === 'select') {
      const options = getSelectOptions(key);
      return (
        <select
          name={key}
          value={value}
          onChange={handleChange}
          className="property-input"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        type={inputType}
        name={key}
        value={value}
        onChange={handleChange}
        className="property-input"
        min={inputType === 'number' ? '0' : undefined}
        step={inputType === 'number' ? (key === 'rejectRate' || key === 'availability' ? '0.1' : '1') : undefined}
      />
    );
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

  // Ordina le proprietà in base al tipo
  const orderedProps = Object.keys(properties).sort((a, b) => {
    // Nome sempre per primo
    if (a === 'name') return -1;
    if (b === 'name') return 1;
    
    // Poi proprietà comuni
    const commonProps = ['cycleTime', 'piecesPerHour', 'operators', 'rejectRate'];
    const aIsCommon = commonProps.includes(a);
    const bIsCommon = commonProps.includes(b);
    
    if (aIsCommon && !bIsCommon) return -1;
    if (!aIsCommon && bIsCommon) return 1;
    
    // Poi il resto in ordine alfabetico
    return formatPropertyName(a).localeCompare(formatPropertyName(b));
  });

  return (
    <div className="panel properties-panel">
      <h3>Proprietà {getObjectTypeTitle()}</h3>
      
      <div className="properties-form">
        {orderedProps.map((key) => (
          <div key={key} className={`property-row ${key === 'name' ? 'highlight' : ''}`}>
            <label>{formatPropertyName(key)}</label>
            {renderField(key, properties[key])}
          </div>
        ))}
      </div>
      
      <div className="panel-footer">
        {needsSave && (
          <button 
            className={`save-properties-btn ${saveStatus === 'saving' ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        )}
        
        {saveStatus === 'success' && (
          <div className="save-status success">
            ✅ Modifiche salvate con successo
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="save-status error">
            ❌ Errore durante il salvataggio
          </div>
        )}
        
        <p className="object-info">
          ID: {selectedObject.id || 'Non salvato'}
        </p>
      </div>
    </div>
  );
};

export default PropertiesPanel;