// FILE: App.js
import React, { useState, useEffect } from 'react';
import CanvasManager from './components/canvas/CanvasManager';
import PropertiesPanel from './components/panels/PropertiesPanel';
import ToolsPanel from './components/panels/ToolsPanel';
import './components/canvas/Canvas.css';
import './components/panels/Panels.css';
import TopMenu from './components/menus/TopMenu';



const App = () => {
  const [currentProject, setCurrentProject] = useState({ id: 11 }); // mock project
  const [nodes, setNodes] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  // ⚡ Mock: carica nodi di progetto all'avvio
  useEffect(() => {
    if (currentProject?.id) {
      fetch(`/api/projects/${currentProject.id}/nodes`)
        .then((res) => res.json())
        .then((data) => setNodes(data))
        .catch((err) => console.error('❌ Errore caricamento nodi:', err));
    }
  }, [currentProject]);

  const handleNodeAdded = async (node) => {
    const response = await fetch(`/api/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node)
    });
    const saved = await response.json();
    setNodes((prev) => [...prev, saved]);
    return saved;
  };

  const handleNodeUpdated = async (updatedData) => {
    if (!selectedObject?.id) return;
    const response = await fetch(`/api/nodes/${selectedObject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const updated = await response.json();
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleSelectTool = (tool) => {
    console.log('🔧 Tool selezionato:', tool);
    // futuro: click-to-place
  };

 return (
    <>
      <TopMenu />
      <div style={{ display: 'flex', height: 'calc(100vh - 40px)' }}>
        <ToolsPanel onSelectTool={handleSelectTool} />
        <CanvasManager
          currentProject={currentProject}
          nodes={nodes}
          onNodeAdded={handleNodeAdded}
          onNodeSelected={setSelectedObject}
          onNodeUpdated={handleNodeUpdated}
        />
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdate={handleNodeUpdated}
        />
      </div>
    </>
  );
};

export default App;
