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
  
  // Nuove variabili per gestire il caricamento differito
  const pendingNodesRef = useRef(null);
  const canvasReadyRef = useRef(false);

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
      
      // Pulisci il canvas se esiste e se è pronto
      if (fabricCanvasRef.current && canvasReadyRef.current) {
        console.log('DEBUG: Pulizia canvas per nuovo progetto');
        try {
          // Utilizziamo una versione più sicura per pulire il canvas
          const canvas = fabricCanvasRef.current;
          const objects = canvas.getObjects();
          
          if (objects && objects.length > 0) {
            // Rimuove gli oggetti uno per uno in modo sicuro
            objects.forEach(obj => {
              canvas.remove(obj);
            });
          }
          
          // Eseguiamo renderAll solo se il canvas è ancora valido
          if (canvas.renderAll && typeof canvas.renderAll === 'function') {
            canvas.renderAll();
          }
          
          console.log('DEBUG: Canvas pulito con successo');
        } catch (err) {
          console.error('DEBUG: Errore durante la pulizia del canvas:', err);
        }
      } else {
        console.log('DEBUG: Canvas non disponibile o non pronto durante la creazione del progetto');
      }
      
      // Resetta i nodi in attesa
      pendingNodesRef.current = null;
      
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
      console.log('DEBUG: Canvas pronto?', canvasReadyRef.current);
      
      // Verifica se il canvas è pronto
      if (fabricCanvasRef.current && canvasReadyRef.current) {
        console.log('DEBUG: Canvas pronto, carico i nodi');
        try {
          // Pulisci il canvas prima
          const canvas = fabricCanvasRef.current;
          
          if (!canvas || typeof canvas.getObjects !== 'function') {
            console.error('DEBUG: Canvas non valido per la pulizia');
            pendingNodesRef.current = projectNodes;
            return;
          }
          
          try {
            const objects = canvas.getObjects();
            
            if (objects && objects.length > 0) {
              // Rimuove gli oggetti uno per uno in modo sicuro
              objects.forEach(obj => {
                canvas.remove(obj);
              });
            }
            
            // Eseguiamo renderAll solo se il canvas è ancora valido
            if (canvas.renderAll && typeof canvas.renderAll === 'function') {
              canvas.renderAll();
            }
          } catch (clearError) {
            console.error('DEBUG: Errore durante pulizia canvas:', clearError);
          }
          
          // Verifica se il canvas è ancora valido dopo la pulizia
          if (canvas && typeof canvas.add === 'function' && typeof canvas.renderAll === 'function') {
            // Carica i nodi nel canvas
            try {
              IconFactory.initializeCanvasWithNodes(canvas, projectNodes);
              console.log('DEBUG: Inizializzazione canvas completata');
            } catch (loadError) {
              console.error('DEBUG: Errore durante caricamento nodi:', loadError);
              pendingNodesRef.current = projectNodes;
            }
          } else {
            console.error('DEBUG: Canvas non più valido dopo la pulizia');
            pendingNodesRef.current = projectNodes;
          }
        } catch (error) {
          console.error('DEBUG: Errore durante inizializzazione canvas:', error);
          // Memorizza i nodi per caricarli successivamente
          pendingNodesRef.current = projectNodes;
        }
      } else {
        console.log('DEBUG: Canvas non pronto, salvo i nodi per più tardi');
        // Memorizza i nodi per caricarli quando il canvas sarà disponibile
        pendingNodesRef.current = projectNodes;
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
    
    // Verifica che il canvas abbia i metodi necessari
    if (typeof canvasRef.add !== 'function' || 
        typeof canvasRef.renderAll !== 'function' ||
        typeof canvasRef.getObjects !== 'function') {
      console.error('DEBUG: Canvas non valido, mancano i metodi necessari');
      return;
    }
    
    // Salva il canvas e segna che è pronto
    fabricCanvasRef.current = canvasRef;
    canvasReadyRef.current = true;
    console.log('DEBUG: Canvas reference impostato e segnato come pronto');
    
    // Se ci sono nodi in attesa, caricali adesso
    if (pendingNodesRef.current) {
      console.log('DEBUG: Ci sono nodi in attesa, caricamento...');
      
      // Attendi un po' per assicurarsi che il canvas sia completamente pronto
      setTimeout(() => {
        try {
          // Pulisci il canvas prima
          const objects = canvasRef.getObjects();
          if (objects && objects.length > 0) {
            objects.forEach(obj => {
              canvasRef.remove(obj);
            });
          }
          
          // Caricamento dei nodi
          IconFactory.initializeCanvasWithNodes(canvasRef, pendingNodesRef.current);
          console.log('DEBUG: Nodi in attesa caricati con successo');
          pendingNodesRef.current = null;
        } catch (error) {
          console.error('DEBUG: Errore durante il caricamento dei nodi in attesa:', error);
        }
      }, 500); // Piccolo ritardo per assicurarsi che il canvas sia pronto
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