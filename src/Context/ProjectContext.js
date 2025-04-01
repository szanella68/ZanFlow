import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchProjects, createProject, fetchNodes, createNode, updateNode as apiUpdateNode } from '../services/api';
import { initializeCanvasWithMachines } from '../components/icons/Machine';
// Creo il context
const ProjectContext = createContext();
const ProjectContext = createContext();
// Hook custom per usare il context
export const useProject = () => useContext(ProjectContext);
export const useProject = () => useContext(ProjectContext);
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);> {
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);t] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);lse);
  const [fabricCanvasRef, setFabricCanvasRef] = useState(null);  const [error, setError] = useState(null);

  // Carica tutti i progetti
  const loadProjects = async () => {= async () => {
    setLoading(true);ading(true);
    try {
      const data = await fetchProjects(); fetchProjects();
      setProjects(data);a);
      setError(null););
    } catch (err) {
      setError('Errore nel caricamento dei progetti');l caricamento dei progetti');
      console.error(err);rror(err);
    } finally {
      setLoading(false); setLoading(false);
    }}
  };  };

  // Crea un nuovo progetto
  const addProject = async (name, description) => {async (name, description) => {
    setLoading(true);ading(true);
    try {
      const newProject = await createProject({ name, description });{ name, description });
      setProjects([...projects, newProject]);roject]);
      setCurrentProject(newProject);ject(newProject);
      setNodes([]);
      setError(null);
      return newProject;ject;
    } catch (err) {
      setError('Errore nella creazione del progetto');lla creazione del progetto');
      console.error(err);r(err);
      return null;ll;
    } finally {
      setLoading(false); setLoading(false);
    }}
  };  };

  // Seleziona un progetto e carica i suoi nodii
  const selectProject = async (projectId) => { = async (projectId) => {
    setLoading(true);ading(true);
    try {
      const selectedProject = projects.find(p => p.id === projectId);;
      if (!selectedProject) throw new Error('Progetto non trovato');if (!selectedProject) throw new Error('Progetto non trovato');
      
      setCurrentProject(selectedProject);setCurrentProject(selectedProject);
      
      // Carica i nodi del progetto
      const projectNodes = await fetchNodes(projectId);ait fetchNodes(projectId);
      setNodes(projectNodes);tNodes);
      setError(null);
    } catch (err) {
      setError('Errore nella selezione del progetto');.current) {
      console.error(err);izeCanvasWithMachines(fabricCanvasRef.current, projectNodes);
    } finally {
      setLoading(false);
    }  setError(null);
  };    } catch (err) {
 progetto');
  // Aggiunge un nodo al progetto corrente
  const addNode = async (nodeData) => {
      setLoading(false);
    }ssun progetto selezionato');
  }; return null;
    }
  // Aggiunge un nodo al progetto corrente
  const addNode = async (nodeData) => {ading(true);
    if (!currentProject) {
      setError('Nessun progetto selezionato');ia associato al progetto corrente
      return null;Project = {
    }
project_id: currentProject.id
    setLoading(true);};
    try {
      // Assicura che il nodo sia associato al progetto correntede(nodeWithProject);
      const nodeWithProject = {des, newNode]);
        ...nodeData,
        project_id: currentProject.ide;
      };
      ll\'aggiunta del nodo');
      const newNode = await createNode(nodeWithProject);r(err);
      setNodes([...nodes, newNode]);ll;
      setError(null);
      return newNode; setLoading(false);
    } catch (err) {}
      setError('Errore nell\'aggiunta del nodo');  };
      console.error(err);
      return null;
    } finally { (nodeId, updatedData) => {
      setLoading(false);
    }ssun progetto selezionato');
  }; return null;
    }
  // Aggiorna un nodo esistente
  const updateNode = async (nodeId, updatedData) => {ading(true);
    if (!currentProject) {
      setError('Nessun progetto selezionato');const updated = await apiUpdateNode(nodeId, updatedData);
      return null;
    }i con il nodo modificato

    setLoading(true);ode.id === nodeId ? updated : node
    try {));
      const updated = await apiUpdateNode(nodeId, updatedData);
      
      // Aggiorna l'array dei nodi con il nodo modificatod;
      setNodes(nodes.map(node => 
        node.id === nodeId ? updated : nodell\'aggiornamento del nodo');
      ));r(err);
      ll;
      setError(null);
      return updated; setLoading(false);
    } catch (err) {}
      setError('Errore nell\'aggiornamento del nodo');  };
      console.error(err);
      return null;f = (canvasRef) => {
    setFabricCanvasRef(canvasRef);
  };Loading(false);
    }
  // Carica i progetti all'avvio
  useEffect(() => {
    loadProjects();tti all'avvio
  }, []);t(() => {
ects();
  const value = {
    projects,
    currentProject, {
    nodes,
    loading,roject,
    error,
    loadProjects,loading,
    addProject,    error,
    selectProject,ojects,
    addNode,
    updateNode,t,
    setCanvasRef
  };updateNode
};
  return (
    <ProjectContext.Provider value={value}>






export default ProjectContext;};  );    </ProjectContext.Provider>      {children}    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;