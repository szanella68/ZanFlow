import React, { useState } from 'react';
import './App.css';
import Canvas from './components/canvas/Canvas';
import TopMenu from './components/menus/TopMenu';
import ToolsPanel from './components/panels/ToolsPanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
// Assicurati di aver creato la cartella src/context prima di usare questa importazione
import { ProjectProvider } from './context/ProjectContext';

function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const handleSelectTool = (toolType) => {
    console.log('Tool selected:', toolType); // Debug log
    setSelectedTool(toolType);
  };

  const handleSelectObject = (object) => {
    console.log('Object selected:', object); // Debug log
    setSelectedObject(object);
  };

  return (
    <ProjectProvider>
      <div className="App">
        <TopMenu />
        <div className="main-container">
          <ToolsPanel onSelectTool={handleSelectTool} />
          <Canvas 
            selectedTool={selectedTool} 
            onSelectObject={handleSelectObject} 
          />
          <PropertiesPanel selectedObject={selectedObject} />
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;