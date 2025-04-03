// FILE: App.js
import React, { useState, useEffect } from 'react';
import CanvasManager from './components/canvas/CanvasManager';
import PropertiesPanel from './components/panels/PropertiesPanel';
import ToolsPanel from './components/panels/ToolsPanel';
import TopMenu from './components/menus/TopMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { useProject } from './context/ProjectContext';
import { fetchNodes, createNode, updateNode } from './services/api';
import './App.css';
import './components/canvas/Canvas.css';
import './components/panels/Panels.css';

const App = () => {
  const { currentProject } = useProject();
  const [nodes, setNodes] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  // Carica i nodi quando cambia il progetto corrente
  useEffect(() => {
    if (currentProject?.id) {
      console.log('Caricamento nodi per il progetto:', currentProject.id);
      fetchNodes(currentProject.id)
        .then((data) => {
          console.log('Nodi caricati:', data);
          setNodes(data);
        })
        .catch((err) => console.error('❌ Errore caricamento nodi:', err));
    } else {
      setNodes([]);
    }
  }, [currentProject]);

  const handleNodeAdded = async (node) => {
    try {
      console.log('Aggiunta nodo:', node);
      const saved = await createNode(node);
      console.log('Nodo salvato:', saved);
      setNodes((prev) => [...prev, saved]);
      return saved;
    } catch (err) {
      console.error('Errore durante l\'aggiunta del nodo:', err);
      throw err;
    }
  };

  const handleNodeUpdated = async (updatedData) => {
    if (!selectedObject?.id) {
      console.error('Nessun nodo selezionato per l\'aggiornamento');
      return;
    }
    
    try {
      console.log('Aggiornamento nodo:', selectedObject.id, updatedData);
      const updated = await updateNode(selectedObject.id, updatedData);
      console.log('Nodo aggiornato:', updated);
      
      // Aggiorna l'array di nodi
      setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      
      // Aggiorna anche l'oggetto selezionato
      if (selectedObject) {
        selectedObject.data = updatedData;
      }
    } catch (err) {
      console.error('Errore durante l\'aggiornamento del nodo:', err);
    }
  };

  const handleSelectTool = (tool) => {
    console.log('🔧 Tool selezionato:', tool);
    setActiveTool(tool);
  };

  return (
    <div className="App">
      <TopMenu />
      <div className="main-container">
        <ToolsPanel onSelectTool={handleSelectTool} />
        
        <ErrorBoundary>
          <CanvasManager
            currentProject={currentProject}
            nodes={nodes}
            onNodeAdded={handleNodeAdded}
            onNodeSelected={setSelectedObject}
            onNodeUpdated={handleNodeUpdated}
            activeTool={activeTool}
          />
        </ErrorBoundary>
        
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdate={handleNodeUpdated}
        />
      </div>
    </div>
  );
};

export default App;