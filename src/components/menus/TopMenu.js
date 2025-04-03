// FILE: TopMenu.js
import React, { useState, useEffect } from 'react';
import './TopMenu.css';
import { useProject } from '../../context/ProjectContext';

const TopMenu = () => {
  const { projects, currentProject, selectProject, addProject, loadProjects } = useProject();
  const [showProjectList, setShowProjectList] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    // Carica i progetti all'inizializzazione
    loadProjects();
  }, [loadProjects]);

  const handleOpenProject = () => {
    loadProjects();
    setShowProjectList(true);
  };

  const handleSelectProject = (id) => {
    selectProject(id);
    setShowProjectList(false);
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

  return (
    <div className="top-menu">
      <div className="menu-item">
        <span>File</span>
        <div className="dropdown-content">
          <button onClick={() => setShowNewDialog(true)}>Nuovo progetto</button>
          <button onClick={handleOpenProject}>Apri progetto</button>
          <button>Salva</button>
        </div>
      </div>
      
      <div className="menu-item">
        <span>Modifica</span>
        <div className="dropdown-content">
          <button>Annulla</button>
          <button>Ripeti</button>
          <button>Elimina</button>
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
        {currentProject ? `ZanFlow - ${currentProject.name}` : 'ZanFlow'}
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
    </div>
  );
};

export default TopMenu;