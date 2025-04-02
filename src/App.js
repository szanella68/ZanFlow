import React, { useState } from 'react';
import './App.css';
import CanvasManager from './components/canvas/CanvasManager';
import TopMenu from './components/menus/TopMenu';
import ToolsPanel from './components/panels/ToolsPanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
import { ProjectProvider, useProject } from './context/ProjectContext';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const { currentProject, nodes, addNode, updateNode } = useProject();

  const handleSelectTool = (toolType) => {
    setSelectedTool(toolType);
  };

  const handleNodeSelected = (object) => {
    setSelectedObject(object);
  };

  const handleNodeAdded = (nodeData, callback) => {
    addNode(nodeData).then(newNode => {
      if (callback && newNode) {
        callback(newNode);
      }
    });
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
            onNodeUpdated={updateNode}
            onNodeSelected={handleNodeSelected}
          />
        </ErrorBoundary>
        <PropertiesPanel selectedObject={selectedObject} />
      </div>
    </div>
  );
};

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;