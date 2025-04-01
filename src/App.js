import React, { useState } from 'react';
import './App.css';
import Canvas from './components/canvas/Canvas';
import TopMenu from './components/menus/TopMenu';
import ToolsPanel from './components/panels/ToolsPanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
import ProjectManager from './components/project/ProjectManager';
import { ProjectProvider } from './context/ProjectContext';

function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const handleSelectTool = (toolType) => {
    setSelectedTool(toolType);
  };

  const handleSelectObject = (object) => {
    setSelectedObject(object);
  };

  return (
    <ProjectProvider>
      <div className="App">
        <TopMenu />
        <ProjectManager />
        <div className="main-container">
          <ToolsPanel onSelectTool={handleSelectTool} />
          <Canvas selectedTool={selectedTool} onSelectObject={handleSelectObject} />
          <PropertiesPanel selectedObject={selectedObject} />
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;