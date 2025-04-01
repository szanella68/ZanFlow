// src/context/ProjectContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchProjects, createProject, fetchNodes, createNode, updateNode as apiUpdateNode } from '../services/api';
import { initializeCanvasWithMachines } from '../components/icons/Machine';

// Create the context
const ProjectContext = createContext();

// Custom hook to use the context
export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fabricCanvasRef, setFabricCanvasRef] = useState(null);

  // Load all projects
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei progetti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const addProject = async (name, description) => {
    setLoading(true);
    try {
      const newProject = await createProject({ name, description });
      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
      setNodes([]);
      setError(null);
      return newProject;
    } catch (err) {
      setError('Errore nella creazione del progetto');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Select a project and load its nodes
  const selectProject = async (projectId) => {
    setLoading(true);
    try {
      const selectedProject = projects.find(p => p.id === projectId);
      if (!selectedProject) throw new Error('Progetto non trovato');
      
      setCurrentProject(selectedProject);
      
      // Load project nodes
      const projectNodes = await fetchNodes(projectId);
      setNodes(projectNodes);
      
      // Initialize canvas with nodes if available
      if (fabricCanvasRef && fabricCanvasRef.current) {
        initializeCanvasWithMachines(fabricCanvasRef.current, projectNodes);
      }
      
      setError(null);
    } catch (err) {
      setError('Errore nella selezione del progetto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a node to current project
  const addNode = async (nodeData) => {
    if (!currentProject) {
      setError('Nessun progetto selezionato');
      return null;
    }
    
    setLoading(true);
    try {
      // Ensure node is associated with current project
      const nodeWithProject = {
        ...nodeData,
        project_id: currentProject.id
      };
      
      const newNode = await createNode(nodeWithProject);
      setNodes([...nodes, newNode]);
      setError(null);
      return newNode;
    } catch (err) {
      setError('Errore nell\'aggiunta del nodo');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing node
  const updateNode = async (nodeId, updatedData) => {
    if (!currentProject) {
      setError('Nessun progetto selezionato');
      return null;
    }
    
    setLoading(true);
    try {
      const updated = await apiUpdateNode(nodeId, updatedData);
      
      // Update nodes array with modified node
      setNodes(nodes.map(node => 
        node.id === nodeId ? updated : node
      ));
      
      setError(null);
      return updated;
    } catch (err) {
      setError('Errore nell\'aggiornamento del nodo');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set canvas reference
  const setCanvasRef = (canvasRef) => {
    setFabricCanvasRef(canvasRef);
  };

  // Load projects on startup
  useEffect(() => {
    loadProjects();
  }, []);

  const value = {
    projects,
    currentProject,
    nodes,
    loading,
    error,
    loadProjects,
    addProject,
    selectProject,
    addNode,
    updateNode,
    setCanvasRef
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;