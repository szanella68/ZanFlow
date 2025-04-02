// src/context/ProjectContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { fetchProjects, createProject, fetchNodes, createNode, updateNode as apiUpdateNode } from '../services/api';
import IconFactory from '../components/icons/IconFactory';

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
  
  // Utilizziamo useRef invece di useState per evitare re-render quando cambia il canvas
  const fabricCanvasRef = useRef(null);
  
  // Flag per tracciare il primo caricamento
  const initialLoadDoneRef = useRef(false);

  // Load all projects
  const loadProjects = async () => {
    console.log('DEBUG: loadProjects iniziato');
    
    setLoading(true);
    try {
      const data = await fetchProjects();
      console.log('DEBUG: Progetti caricati:', data);
      setProjects(data);
      setError(null);
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error('DEBUG: Errore loadProjects:', err);
      setError('Errore nel caricamento dei progetti');
    } finally {
      setLoading(false);
      console.log('DEBUG: loadProjects completato');
    }
  };

  // Create a new project
  const addProject = async (name, description) => {
    console.log('DEBUG: addProject iniziato');
    
    setLoading(true);
    try {
      const newProject = await createProject({ name, description });
      console.log('DEBUG: Nuovo progetto creato:', newProject);
      
      setProjects(prevProjects => [...prevProjects, newProject]);
      setCurrentProject(newProject);
      setNodes([]);
      
      // Pulisci il canvas se esiste
      if (fabricCanvasRef.current) {
        console.log('DEBUG: Pulizia canvas per nuovo progetto');
        try {
          fabricCanvasRef.current.clear();
          fabricCanvasRef.current.renderAll();
          console.log('DEBUG: Canvas pulito con successo');
        } catch (err) {
          console.error('DEBUG: Errore durante la pulizia del canvas:', err);
        }
      } else {
        console.log('DEBUG: Canvas non disponibile durante la creazione del progetto');
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('DEBUG: Errore nella creazione del progetto:', err);
      setError('Errore nella creazione del progetto');
      return false;
    } finally {
      setLoading(false);
      console.log('DEBUG: addProject completato');
    }
  };

  // Select a project and load its nodes
  const selectProject = async (projectId) => {
    console.log(`DEBUG: selectProject iniziato per ID: ${projectId}`);
    
    setLoading(true);
    try {
      const selectedProject = projects.find(p => p.id === projectId);
      console.log('DEBUG: Progetto trovato:', selectedProject);
      
      if (!selectedProject) {
        console.error('DEBUG: Progetto non trovato!');
        throw new Error('Progetto non trovato');
      }
      
      setCurrentProject(selectedProject);
      
      // Carica i nodi del progetto
      console.log('DEBUG: Recupero nodi per il progetto');
      const projectNodes = await fetchNodes(projectId);
      console.log('DEBUG: Nodi recuperati:', projectNodes);
      setNodes(projectNodes);
      
      // Controllo canvas
      console.log('DEBUG: Stato fabricCanvasRef:', fabricCanvasRef.current ? 'disponibile' : 'non disponibile');
      
      // Inizializzazione canvas con i nodi
      if (fabricCanvasRef.current) {
        try {
          console.log('DEBUG: Tentativo inizializzazione canvas con nodi');
          
          // Controllo metodi canvas
          const hasValidClear = typeof fabricCanvasRef.current.clear === 'function';
          const hasValidRender = typeof fabricCanvasRef.current.renderAll === 'function';
          
          console.log('DEBUG: Canvas ha metodo clear?', hasValidClear);
          console.log('DEBUG: Canvas ha metodo renderAll?', hasValidRender);
          
          if (hasValidClear && hasValidRender) {
            // Aggiungiamo un ritardo per assicurarci che il canvas sia completamente pronto
            setTimeout(() => {
              try {
                IconFactory.initializeCanvasWithNodes(fabricCanvasRef.current, projectNodes);
                console.log('DEBUG: Inizializzazione canvas completata');
              } catch (delayedError) {
                console.error('DEBUG: Errore durante inizializzazione ritardata:', delayedError);
              }
            }, 100);
          } else {
            console.error('DEBUG: Canvas non completamente inizializzato');
          }
        } catch (error) {
          console.error('DEBUG: Errore durante inizializzazione canvas:', error);
        }
      } else {
        console.log('DEBUG: Canvas non disponibile durante caricamento progetto');
      }
      
      setError(null);
    } catch (err) {
      console.error('DEBUG: Errore in selectProject:', err);
      setError('Errore nella selezione del progetto');
    } finally {
      setLoading(false);
      console.log('DEBUG: selectProject completato');
    }
  };

  // Add a node to current project
  const addNode = async (nodeData) => {
    console.log('DEBUG: addNode iniziato');
    
    if (!currentProject) {
      console.error('DEBUG: Nessun progetto selezionato per addNode');
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
      
      console.log('DEBUG: Dati nodo da salvare:', nodeWithProject);
      
      const newNode = await createNode(nodeWithProject);
      console.log('DEBUG: Nodo salvato nel DB:', newNode);
      
      setNodes(prevNodes => [...prevNodes, newNode]);
      setError(null);
      return newNode;
    } catch (err) {
      console.error('DEBUG: Errore in addNode:', err);
      setError('Errore nell\'aggiunta del nodo');
      return null;
    } finally {
      setLoading(false);
      console.log('DEBUG: addNode completato');
    }
  };

  // Update an existing node
  const updateNode = async (nodeId, updatedData) => {
    console.log(`DEBUG: updateNode iniziato per ID: ${nodeId}`);
    console.log('DEBUG: Dati aggiornamento:', updatedData);
    
    if (!currentProject) {
      console.error('DEBUG: Nessun progetto selezionato per updateNode');
      setError('Nessun progetto selezionato');
      return null;
    }
    
    setLoading(true);
    try {
      const updated = await apiUpdateNode(nodeId, updatedData);
      console.log('DEBUG: Nodo aggiornato nel DB:', updated);
      
      // Update nodes array with modified node
      setNodes(prevNodes => prevNodes.map(node => 
        node.id === nodeId ? updated : node
      ));
      
      setError(null);
      return updated;
    } catch (err) {
      console.error('DEBUG: Errore in updateNode:', err);
      setError('Errore nell\'aggiornamento del nodo');
      return null;
    } finally {
      setLoading(false);
      console.log('DEBUG: updateNode completato');
    }
  };

  // Set canvas reference
  const setCanvasRef = (canvasRef) => {
    console.log('DEBUG: setCanvasRef chiamato');
    
    // Verifiche di validità
    if (!canvasRef) {
      console.error('DEBUG: Tentativo di impostare un canvas null/undefined');
      return;
    }
    
    if (typeof canvasRef.clear !== 'function' || typeof canvasRef.renderAll !== 'function') {
      console.error('DEBUG: Tentativo di impostare un canvas non valido');
      return;
    }
    
    // Poiché usiamo useRef, possiamo aggiornare il valore direttamente
    // senza causare re-render
    if (!fabricCanvasRef.current) {
      console.log('DEBUG: Impostazione iniziale del canvas reference');
      fabricCanvasRef.current = canvasRef;
    } else {
      console.log('DEBUG: Canvas reference già impostato, aggiornamento ignorato');
    }
  };

  // Load projects on startup
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      console.log('DEBUG: Caricamento iniziale progetti');
      loadProjects();
    }
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