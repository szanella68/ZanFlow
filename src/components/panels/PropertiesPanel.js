import React, { useState, useEffect } from 'react';
import './Panels.css';
import { useProject } from '../../context/ProjectContext';

const PropertiesPanel = ({ selectedObject }) => {
  const { updateNode } = useProject();
  const [properties, setProperties] = useState({
    name: '',
    cycleTime: 0,
    piecesPerHour: 0,
    operators: 0,
    rejectRate: 0
  });
  
  // Proprietà specifiche per tipo di nodo
  const [machineProperties, setMachineProperties] = useState({
    throughputTime: 0,
    supplier: 'interno',
    hourlyCost: 0,
    availability: 100
  });
  
  const [transportProperties, setTransportProperties] = useState({
    transportType: 'manuale',
    throughputTime: 0,
    distance: 0,
    minBatch: 1
  });
  
  const [storageProperties, setStorageProperties] = useState({
    capacity: 0,
    averageStayTime: 0,
    managementMethod: 'FIFO',
    storageCost: 0
  });

  // Aggiorna i campi quando viene selezionato un oggetto
  useEffect(() => {
    if (selectedObject) {
      // Controllo che ci siano dei dati nell'oggetto selezionato
      const objectData = selectedObject.data || {};
      
      // Aggiorna i campi comuni
      setProperties({
        name: objectData.name || selectedObject.objectType || '',
        cycleTime: objectData.cycleTime || 0,
        piecesPerHour: objectData.piecesPerHour || 0,
        operators: objectData.operators || 0,
        rejectRate: objectData.rejectRate || 0
      });
      
      // Aggiorna i campi specifici in base al tipo
      switch (selectedObject.objectType) {
        case 'machine':
          setMachineProperties({
            throughputTime: objectData.throughputTime || 0,
            supplier: objectData.supplier || 'interno',
            hourlyCost: objectData.hourlyCost || 0,
            availability: objectData.availability || 100
          });
          break;
        case 'transport':
          setTransportProperties({
            transportType: objectData.transportType || 'manuale',
            throughputTime: objectData.throughputTime || 0,
            distance: objectData.distance || 0,
            minBatch: objectData.minBatch || 1
          });
          break;
        case 'storage':
          setStorageProperties({
            capacity: objectData.capacity || 0,
            averageStayTime: objectData.averageStayTime || 0,
            managementMethod: objectData.managementMethod || 'FIFO',
            storageCost: objectData.storageCost || 0
          });
          break;
        default:
          break;
      }
    }
  }, [selectedObject]);

  // Gestisce i cambiamenti ai campi comuni
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperties({
      ...properties,
      [name]: name === 'name' ? value : parseFloat(value)
    });
  };

  // Gestisce i cambiamenti ai campi specifici per macchina
  const handleMachineChange = (e) => {
    const { name, value } = e.target;
    setMachineProperties({
      ...machineProperties,
      [name]: name === 'supplier' ? value : parseFloat(value)
    });
  };

  // Gestisce i cambiamenti ai campi specifici per trasporto
  const handleTransportChange = (e) => {
    const { name, value } = e.target;
    setTransportProperties({
      ...transportProperties,
      [name]: name === 'transportType' ? value : parseFloat(value)
    });
  };

  // Gestisce i cambiamenti ai campi specifici per magazzino
  const handleStorageChange = (e) => {
    const { name, value } = e.target;
    setStorageProperties({
      ...storageProperties,
      [name]: ['managementMethod'].includes(name) ? value : parseFloat(value)
    });
  };

  // Applica le modifiche all'oggetto selezionato
  const handleApply = () => {
    if (!selectedObject) return;
    
    // Unisci i dati comuni con quelli specifici del tipo
    let updatedData = { ...properties };
    
    switch (selectedObject.objectType) {
      case 'machine':
        updatedData = { ...updatedData, ...machineProperties };
        break;
      case 'transport':
        updatedData = { ...updatedData, ...transportProperties };
        break;
      case 'storage':
        updatedData = { ...updatedData, ...storageProperties };
        break;
      default:
        break;
    }
    
    // Aggiorna i dati nell'oggetto sul canvas
    if (selectedObject._objects) {
      // Aggiorna il testo se presente
      selectedObject._objects.forEach(obj => {
        if (obj.type === 'textbox') {
          obj.set('text', properties.name);
        }
      });

      // Aggiorna i dati interni dell'oggetto
      selectedObject.set('data', updatedData);
      
      // Richiedi il render del canvas
      selectedObject.canvas?.renderAll();
    }
    
    // Qui verrà aggiunta la logica per aggiornare il database
    if (selectedObject.dbId) {
      updateNode(selectedObject.dbId, updatedData);
    }
  };

  if (!selectedObject) {
    return (
      <div className="panel properties-panel">
        <h3>Proprietà</h3>
        <p className="property-message">Seleziona un elemento per visualizzarne le proprietà</p>
      </div>
    );
  }

  return (
    <div className="panel properties-panel">
      <h3>Proprietà {selectedObject.objectType}</h3>
      
      {/* Campi comuni per tutti i tipi */}
      <div className="property-group">
        <label>Nome:</label>
        <input 
          type="text" 
          name="name"
          value={properties.name} 
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label>Tempo ciclo (s):</label>
        <input 
          type="number" 
          name="cycleTime"
          value={properties.cycleTime} 
          min="0" 
          step="0.1" 
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label>Pezzi/ora:</label>
        <input 
          type="number" 
          name="piecesPerHour"
          value={properties.piecesPerHour} 
          min="0" 
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label>Operatori:</label>
        <input 
          type="number" 
          name="operators"
          value={properties.operators} 
          min="0" 
          onChange={handleChange}
        />
      </div>
      <div className="property-group">
        <label>Scarto (%):</label>
        <input 
          type="number" 
          name="rejectRate"
          value={properties.rejectRate} 
          min="0" 
          max="100" 
          step="0.1" 
          onChange={handleChange}
        />
      </div>
      
      {/* Campi specifici per tipo di oggetto */}
      {selectedObject.objectType === 'machine' && (
        <>
          <div className="property-group">
            <label>Tempo attraversamento (s):</label>
            <input 
              type="number" 
              name="throughputTime"
              value={machineProperties.throughputTime} 
              min="0" 
              step="0.1" 
              onChange={handleMachineChange}
            />
          </div>
          <div className="property-group">
            <label>Fornitore:</label>
            <select 
              name="supplier"
              value={machineProperties.supplier} 
              onChange={handleMachineChange}
            >
              <option value="interno">Interno</option>
              <option value="esterno">Esterno</option>
            </select>
          </div>
          <div className="property-group">
            <label>Costo orario (€):</label>
            <input 
              type="number" 
              name="hourlyCost"
              value={machineProperties.hourlyCost} 
              min="0" 
              step="0.1" 
              onChange={handleMachineChange}
            />
          </div>
          <div className="property-group">
            <label>Disponibilità (%):</label>
            <input 
              type="number" 
              name="availability"
              value={machineProperties.availability} 
              min="0" 
              max="100" 
              step="0.1" 
              onChange={handleMachineChange}
            />
          </div>
        </>
      )}
      
      {selectedObject.objectType === 'transport' && (
        <>
          <div className="property-group">
            <label>Tipo trasporto:</label>
            <select 
              name="transportType"
              value={transportProperties.transportType} 
              onChange={handleTransportChange}
            >
              <option value="manuale">Manuale</option>
              <option value="automatico">Automatico</option>
              <option value="veicolo">Veicolo</option>
            </select>
          </div>
          <div className="property-group">
            <label>Tempo attraversamento (s):</label>
            <input 
              type="number" 
              name="throughputTime"
              value={transportProperties.throughputTime} 
              min="0" 
              step="0.1" 
              onChange={handleTransportChange}
            />
          </div>
          <div className="property-group">
            <label>Distanza (m):</label>
            <input 
              type="number" 
              name="distance"
              value={transportProperties.distance} 
              min="0" 
              step="0.1" 
              onChange={handleTransportChange}
            />
          </div>
          <div className="property-group">
            <label>Batch minimo:</label>
            <input 
              type="number" 
              name="minBatch"
              value={transportProperties.minBatch} 
              min="1" 
              onChange={handleTransportChange}
            />
          </div>
        </>
      )}
      
      {selectedObject.objectType === 'storage' && (
        <>
          <div className="property-group">
            <label>Capacità:</label>
            <input 
              type="number" 
              name="capacity"
              value={storageProperties.capacity} 
              min="0" 
              onChange={handleStorageChange}
            />
          </div>
          <div className="property-group">
            <label>Tempo medio permanenza (h):</label>
            <input 
              type="number" 
              name="averageStayTime"
              value={storageProperties.averageStayTime} 
              min="0" 
              step="0.1" 
              onChange={handleStorageChange}
            />
          </div>
          <div className="property-group">
            <label>Metodo gestione:</label>
            <select 
              name="managementMethod"
              value={storageProperties.managementMethod} 
              onChange={handleStorageChange}
            >
              <option value="FIFO">FIFO</option>
              <option value="LIFO">LIFO</option>
            </select>
          </div>
          <div className="property-group">
            <label>Costo stoccaggio (€/h):</label>
            <input 
              type="number" 
              name="storageCost"
              value={storageProperties.storageCost} 
              min="0" 
              step="0.01" 
              onChange={handleStorageChange}
            />
          </div>
        </>
      )}
      
      <button className="apply-button" onClick={handleApply}>Applica</button>
    </div>
  );
};

export default PropertiesPanel;