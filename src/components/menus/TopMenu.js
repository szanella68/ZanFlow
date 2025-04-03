// FILE: TopMenu.js
import React, { useState, useEffect } from 'react';
import './TopMenu.css';
import { useProject } from '../../context/ProjectContext';

const TopMenu = ({ onSave, hasUnsavedChanges, selectedObject, onDeleteNode }) => {
  const { projects, currentProject, selectProject, addProject, loadProjects } = useProject();
  const [showProjectList, setShowProjectList] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    // Carica i progetti all'inizializzazione
    loadProjects();
  }, [loadProjects]);

  const handleOpenProject = () => {
    // Se ci sono modifiche non salvate, chiedi conferma
    if (hasUnsavedChanges) {
      setPendingAction('openProject');
      setShowConfirmDialog(true);
    } else {
      proceedToOpenProject();
    }
  };

  const proceedToOpenProject = () => {
    loadProjects();
    setShowProjectList(true);
  };

  const handleSelectProject = (id) => {
    // Se ci sono modifiche non salvate, chiedi conferma
    if (hasUnsavedChanges && currentProject?.id !== id) {
      setPendingAction(() => () => {
        selectProject(id);
        setShowProjectList(false);
      });
      setShowConfirmDialog(true);
    } else {
      selectProject(id);
      setShowProjectList(false);
    }
  };

  const handleNewProject = () => {
    // Se ci sono modifiche non salvate, chiedi conferma
    if (hasUnsavedChanges) {
      setPendingAction('newProject');
      setShowConfirmDialog(true);
    } else {
      setShowNewDialog(true);
    }
  };

  const confirmNewProject = async () => {
    if (newProjectName.trim()) {
      await addProject({ name: newProjectName, description: newProjectDescription });
      setShowNewDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } else {
      alert('Inserisci un nome per il progetto.');
    }
  };

  const handleSave = () => {
    if (onSave && typeof onSave === 'function') {
      onSave();
    }
  };

  const handleConfirmAction = () => {
    setShowConfirmDialog(false);
    
    if (typeof pendingAction === 'function') {
      pendingAction();
    } else if (pendingAction === 'openProject') {
      proceedToOpenProject();
    } else if (pendingAction === 'newProject') {
      setShowNewDialog(true);
    }
    
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <div className="top-menu">
      <div className="menu-item">
        <span>File</span>
        <div className="dropdown-content">
          <button onClick={handleNewProject}>Nuovo progetto</button>
          <button onClick={handleOpenProject}>Apri progetto</button>
          <button onClick={handleSave} disabled={!currentProject || !hasUnsavedChanges}>Salva</button>
        </div>
      </div>
      
      <div className="menu-item">
        <span>Modifica</span>
        <div className="dropdown-content">
          <button>Annulla</button>
          <button>Ripeti</button>
          <button 
            onClick={() => {
              if (selectedObject && selectedObject.id && onDeleteNode) {
                if (window.confirm('Sei sicuro di voler eliminare questo elemento?')) {
                  onDeleteNode(selectedObject.id);
                }
              } else {
                alert('Seleziona prima un elemento da eliminare');
              }
            }} 
            disabled={!selectedObject}
          >
            Elimina
          </button>
        </div>
      </div>
      
      <div className="menu-item">
        <span>Visualizza</span>
        <div className="dropdown-content">
          <button>Zoom +</button>
          <button>Zoom -</button>
          <button>Adatta alla finestra</button>
        </div>
      </div>
      
      <div className="app-title">
        {currentProject ? (
          <>
            ZanFlow - {currentProject.name}
            {hasUnsavedChanges && <span className="unsaved-indicator">*</span>}
          </>
        ) : 'ZanFlow'}
      </div>

      {/* Dialog per selezionare un progetto esistente */}
      {showProjectList && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Seleziona un progetto</h3>
            {projects.length === 0 ? (
              <p>Nessun progetto disponibile. Creane uno nuovo.</p>
            ) : (
              <ul className="projects-list">
                {projects.map((project) => (
                  <li 
                    key={project.id} 
                    className={currentProject?.id === project.id ? 'selected' : ''}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <span className="project-name">{project.name}</span>
                    <span className="project-date">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="dialog-buttons">
              <button onClick={() => setShowProjectList(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog per creare un nuovo progetto */}
      {showNewDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Nuovo Progetto</h3>
            <div className="form-group">
              <label>Nome progetto:</label>
              <input
                type="text"
                placeholder="Inserisci nome progetto"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Descrizione:</label>
              <textarea
                placeholder="Inserisci descrizione (opzionale)"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows="3"
              />
            </div>
            <div className="dialog-buttons">
              <button onClick={confirmNewProject}>Crea</button>
              <button onClick={() => setShowNewDialog(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dialog di conferma per azioni con modifiche non salvate */}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Attenzione</h3>
            <p>Ci sono modifiche non salvate. Vuoi procedere senza salvare?</p>
            <div className="dialog-buttons">
              <button onClick={handleConfirmAction}>Procedi senza salvare</button>
              <button onClick={handleCancelAction}>Annulla</button>
              <button 
                onClick={() => {
                  handleSave();
                  handleConfirmAction();
                }}
                className="save-button"
              >
                Salva e procedi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMenu;