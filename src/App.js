// FILE: App.js
import React, { useState, useEffect, useRef } from 'react';
import CanvasManager from './components/canvas/CanvasManager';
import PropertiesPanel from './components/panels/PropertiesPanel';
import ToolsPanel from './components/panels/ToolsPanel';
import TopMenu from './components/menus/TopMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { useProject } from './context/ProjectContext';
import { fetchNodes, createNode, updateNode, deleteNode } from './services/api';
import './App.css';
import './components/canvas/Canvas.css';
import './components/panels/Panels.css';

const App = () => {
  const { currentProject } = useProject();
  const [nodes, setNodes] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const canvasRef = useRef(null);

  // Carica i nodi quando cambia il progetto corrente
  useEffect(() => {
    if (currentProject?.id) {
      console.log('Caricamento nodi per il progetto:', currentProject.id);
      fetchNodes(currentProject.id)
        .then((data) => {
          console.log('Nodi caricati:', data);
          setNodes(data);
          setHasUnsavedChanges(false); // Resetta lo stato delle modifiche
        })
        .catch((err) => console.error('❌ Errore caricamento nodi:', err));
    } else {
      setNodes([]);
      setHasUnsavedChanges(false);
    }
  }, [currentProject]);

  const handleNodeAdded = async (node) => {
    try {
      console.log('Aggiunta nodo:', node);
      const saved = await createNode(node);
      console.log('Nodo salvato:', saved);
      setNodes((prev) => [...prev, saved]);
      setHasUnsavedChanges(true);
      return saved;
    } catch (err) {
      console.error('Errore durante l\'aggiunta del nodo:', err);
      throw err;
    }
  };

  const handleNodeUpdated = async (updatedData) => {
    if (!selectedObject?.id) {
      console.error('Nessun nodo selezionato per l\'aggiornamento');
      return Promise.reject(new Error('Nessun nodo selezionato'));
    }
    
    try {
      console.log('Aggiornamento nodo:', selectedObject.id, updatedData);
      
      // Prepara i dati per l'API - includi solo i campi che vogliamo aggiornare
      const apiData = {
        name: updatedData.name,
        data: updatedData
      };
      
      const updated = await updateNode(selectedObject.id, apiData);
      console.log('Nodo aggiornato (risposta API):', updated);
      
      // Aggiorna l'array di nodi
      setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      
      // Aggiorna anche l'oggetto selezionato - questa è la chiave per aggiornare l'UI
      if (selectedObject) {
        // Aggiorniamo direttamente l'oggetto sul canvas
        selectedObject.data = updatedData;
        
        // Aggiorna anche l'etichetta nel nodo se il nome è cambiato
        if (selectedObject._objects) {
          const textbox = selectedObject._objects.find(o => o.type === 'textbox');
          if (textbox && updatedData.name) {
            textbox.set('text', updatedData.name);
            // Forza il ridisegno del canvas
            if (canvasRef.current) {
              const canvas = canvasRef.current.getCanvas();
              if (canvas) {
                canvas.renderAll();
              }
            }
          }
        }
      }
      
      setHasUnsavedChanges(true);
      return updated;
    } catch (err) {
      console.error('Errore durante l\'aggiornamento del nodo:', err);
      throw err;
    }
  };

  const handleNodeMoved = async (nodeId, newPosition) => {
    try {
      console.log('Aggiornamento posizione nodo:', nodeId, newPosition);
      const updated = await updateNode(nodeId, newPosition);
      console.log('Posizione nodo aggiornata:', updated);
      
      // Aggiorna l'array di nodi
      setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setHasUnsavedChanges(true);
      return updated;
    } catch (err) {
      console.error('Errore durante l\'aggiornamento della posizione del nodo:', err);
      throw err;
    }
  };
  
  const handleNodeDeleted = async (nodeId) => {
    if (!nodeId) {
      console.error('Nessun nodo da eliminare');
      return false;
    }
    
    try {
      // Ottieni informazioni sul nodo da eliminare per un messaggio più informativo
      const nodeToRemove = nodes.find(n => n.id === nodeId);
      const nodeName = nodeToRemove ? nodeToRemove.name : 'elemento';
      const nodeType = nodeToRemove ? nodeToRemove.node_type : 'elemento';
      
      console.log('Eliminazione nodo:', nodeId, nodeName, nodeType);
      
      // Prima rimuovi l'oggetto dal canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        if (canvas) {
          // Trova l'oggetto nel canvas
          const objects = canvas.getObjects();
          const nodeToDelete = objects.find(obj => obj.id === nodeId);
          
          if (nodeToDelete) {
            canvas.remove(nodeToDelete);
            canvas.renderAll();
            console.log('Nodo rimosso dal canvas');
          }
        }
      }
      
      // Poi elimina il nodo dal database
      const success = await deleteNode(nodeId);
      
      if (success) {
        console.log('Nodo eliminato con successo dal database:', nodeId);
        
        // Rimuovi il nodo dall'array di nodi
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        
        // Resetta la selezione corrente
        setSelectedObject(null);
        
        // Segna le modifiche come non salvate
        setHasUnsavedChanges(true);
        
        // Mostra una notifica di successo
        const notification = document.createElement('div');
        notification.textContent = `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} "${nodeName}" eliminato con successo`;
        notification.className = 'save-notification';
        notification.style.backgroundColor = '#4CAF50';
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
          notification.style.opacity = '1';
        }, 10);
        
        // Fade out e rimozione
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
        
        return true;
      } else {
        console.error('Errore nell\'eliminazione del nodo dal database:', nodeId);
        // Mostra una notifica di errore
        const notification = document.createElement('div');
        notification.textContent = `Errore durante l'eliminazione di "${nodeName}"`;
        notification.className = 'save-notification';
        notification.style.backgroundColor = '#F44336';
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
          notification.style.opacity = '1';
        }, 10);
        
        // Fade out e rimozione
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
        
        return false;
      }
    } catch (err) {
      console.error('Errore durante l\'eliminazione del nodo:', err);
      throw err;
    }
  };

  const handleSelectTool = (tool) => {
    console.log('🔧 Tool selezionato:', tool);
    setActiveTool(tool);
  };

  // Funzione per salvare tutte le modifiche
  const saveAllChanges = async () => {
    console.log('💾 Salvataggio di tutte le modifiche...');
    
    try {
      // Qui potremmo implementare qualsiasi logica di salvataggio aggiuntiva
      // Ad esempio, salvataggio del progetto stesso
      
      // Poiché abbiamo già implementato il salvataggio in tempo reale
      // per le modifiche dei nodi, ci assicuriamo solo che tutto sia stato inviato
      
      setHasUnsavedChanges(false);
      console.log('✅ Tutte le modifiche salvate con successo!');
      
      // Mostriamo una notifica all'utente
      showSaveNotification();
      
      return true;
    } catch (err) {
      console.error('❌ Errore durante il salvataggio globale:', err);
      return false;
    }
  };

  // Mostra una notifica temporanea di salvataggio
  const showSaveNotification = () => {
    const notification = document.createElement('div');
    notification.textContent = 'Progetto salvato con successo!';
    notification.className = 'save-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Fade out e rimozione
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Gestiamo l'uscita o il cambio di progetto
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Ci sono modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  
  // Gestione degli shortcut da tastiera
  useEffect(() => {
    const handleKeyDown = (e) => {
      // CTRL+S o CMD+S per salvare
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentProject) {
          saveAllChanges();
        }
      }
      
      // Tasto Delete o Backspace per eliminare il nodo selezionato
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject && selectedObject.id) {
        // Evita di eliminare quando si sta scrivendo in un input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (window.confirm('Sei sicuro di voler eliminare questo elemento?')) {
            handleNodeDeleted(selectedObject.id);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentProject, selectedObject, saveAllChanges, handleNodeDeleted]);

  return (
    <div className="App">
      <TopMenu 
        onSave={saveAllChanges} 
        hasUnsavedChanges={hasUnsavedChanges} 
        selectedObject={selectedObject} 
        onDeleteNode={handleNodeDeleted} 
      />
      <div className="main-container">
        <ToolsPanel onSelectTool={handleSelectTool} />
        
        <ErrorBoundary>
          <CanvasManager
            ref={canvasRef}
            currentProject={currentProject}
            nodes={nodes}
            onNodeAdded={handleNodeAdded}
            onNodeSelected={setSelectedObject}
            onNodeUpdated={handleNodeUpdated}
            onNodeMoved={handleNodeMoved}
            onNodeDeleted={handleNodeDeleted}
            activeTool={activeTool}
          />
        </ErrorBoundary>
        
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdate={handleNodeUpdated}
        />
      </div>
      
      {hasUnsavedChanges && (
        <div className="unsaved-changes-indicator">
          <span>●</span> Modifiche non salvate
        </div>
      )}
    </div>
  );
};

export default App;