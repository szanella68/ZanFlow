import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchProjects, createProject, fetchNodes, createNode, updateNode as apiUpdateNode } from '../services/api';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Carica tutti i progetti
  const loadProjects = async () => {
    console.log('Caricamento progetti iniziato');
    setLoading(true);
    
    try {
      const data = await fetchProjects();
      setProjects(data);
      setError(null);
      console.log(`Caricati ${data.length} progetti`);
    } catch (err) {
      console.error('Errore nel caricamento dei progetti:', err);
      setError('Errore nel caricamento dei progetti');
    } finally {
      setLoading(false);
    }
  };
  
  // Carica all'avvio
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Crea un nuovo progetto
  const addProject = async (name, description) => {
    console.log('Creazione nuovo progetto:', name);
    setLoading(true);
    
    try {
      const newProject = await createProject({ name, description });
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      setNodes([]);
      setError(null);
      console.log('Nuovo progetto creato con ID:', newProject.id);
      return true;
    } catch (err) {
      console.error('Errore nella creazione del progetto:', err);
      setError('Errore nella creazione del progetto');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Seleziona un progetto
  const selectProject = async (projectId) => {
    console.log('Selezione progetto:', projectId);
    setLoading(true);
    
    try {
      const selectedProject = projects.find(p => p.id === projectId);
      if (!selectedProject) {
        throw new Error('Progetto non trovato');
      }
      
      setCurrentProject(selectedProject);
      
      // Carica i nodi del progetto
      console.log('Caricamento nodi per progetto ID:', projectId);
      const projectNodes = await fetchNodes(projectId);
      setNodes(projectNodes);
      console.log(`Caricati ${projectNodes.length} nodi`);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Errore nella selezione del progetto:', err);
      setError('Errore nella selezione del progetto');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Aggiungi un nodo
  const addNode = async (nodeData) => {
    if (!currentProject) {
      console.error('Nessun progetto selezionato');
      setError('Nessun progetto selezionato');
      return null;
    }
    
    console.log('Aggiunta nodo al progetto:', currentProject.id);
    setLoading(true);
    
    try {
      // Assicura che il nodo sia associato al progetto corrente
      const nodeWithProject = {
        ...nodeData,
        project_id: currentProject.id
      };
      
      const newNode = await createNode(nodeWithProject);
      setNodes(prev => [...prev, newNode]);
      setError(null);
      console.log('Nuovo nodo creato con ID:', newNode.id);
      return newNode;
    } catch (err) {
      console.error('Errore nell\'aggiunta del nodo:', err);
      setError('Errore nell\'aggiunta del nodo');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Aggiorna un nodo
  const updateNode = async (nodeId, updatedData) => {
    if (!currentProject) {
      console.error('Nessun progetto selezionato');
      setError('Nessun progetto selezionato');
      return null;
    }
    
    console.log('Aggiornamento nodo ID:', nodeId);
    setLoading(true);
    
    try {
      const updated = await apiUpdateNode(nodeId, updatedData);
      
      // Aggiorna l'array dei nodi
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? updated : node
      ));
      
      setError(null);
      console.log('Nodo aggiornato con successo');
      return updated;
    } catch (err) {
      console.error('Errore nell\'aggiornamento del nodo:', err);
      setError('Errore nell\'aggiornamento del nodo');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
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