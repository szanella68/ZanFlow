import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchProjects, createProject, fetchNodes, createNode, updateNode as apiUpdateNode } from '../services/api';

// Creo il context
const ProjectContext = createContext();

// Hook custom per usare il context
export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica tutti i progetti
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

  // Crea un nuovo progetto
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

  // Seleziona un progetto e carica i suoi nodi
  const selectProject = async (projectId) => {
    setLoading(true);
    try {
      const selectedProject = projects.find(p => p.id === projectId);
      if (!selectedProject) throw new Error('Progetto non trovato');
      
      setCurrentProject(selectedProject);
      
      // Carica i nodi del progetto
      const projectNodes = await fetchNodes(projectId);
      setNodes(projectNodes);
      setError(null);
    } catch (err) {
      setError('Errore nella selezione del progetto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aggiunge un nodo al progetto corrente
  const addNode = async (nodeData) => {
    if (!currentProject) {
      setError('Nessun progetto selezionato');
      return null;
    }

    setLoading(true);
    try {
      // Assicura che il nodo sia associato al progetto corrente
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

  // Aggiorna un nodo esistente
  const updateNode = async (nodeId, updatedData) => {
    if (!currentProject) {
      setError('Nessun progetto selezionato');
      return null;
    }

    setLoading(true);
    try {
      const updated = await apiUpdateNode(nodeId, updatedData);
      
      // Aggiorna l'array dei nodi con il nodo modificato
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

  // Carica i progetti all'avvio
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
    updateNode
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;