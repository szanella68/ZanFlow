import React, { useState, useEffect } from 'react';
import './TopMenu.css';
import { useProject } from '../../context/ProjectContext';

const TopMenu = () => {
  const { 
    addProject, 
    loadProjects, 
    selectProject, 
    projects, 
    currentProject,
    loading
  } = useProject();
  
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Carica i progetti all'avvio del componente
  useEffect(() => {
    // Utilizziamo questa sintassi per evitare il loop infinito
    // Non includiamo loadProjects nella lista di dipendenze
    const loadInitialProjects = async () => {
      await loadProjects();
    };
    
    loadInitialProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gestisce la creazione di un nuovo progetto
  const handleNewProject = () => {
    setShowNewDialog(true);
    setShowOpenDialog(false);
  };

  // Gestisce l'apertura della finestra di dialogo per aprire progetti
  const handleOpenProject = () => {
    setShowOpenDialog(true);
    setShowNewDialog(false);
    
    // Ricarica l'elenco dei progetti solo se non stiamo già caricando
    if (!loading) {
      loadProjects();
    }
  };

  // Gestisce il salvataggio del progetto corrente
  const handleSaveProject = () => {
    // Per ora mostriamo solo un messaggio, in seguito implementeremo il salvataggio effettivo
    if (currentProject) {
      alert(`Progetto "${currentProject.name}" salvato con successo!`);
    } else {
      alert('Nessun progetto selezionato da salvare.');
    }
  };

  // Conferma la creazione di un nuovo progetto
  const confirmNewProject = async () => {
    if (newProjectName.trim()) {
      const success = await addProject(newProjectName, newProjectDescription);
      if (success) {
        setShowNewDialog(false);
        setNewProjectName('');
        setNewProjectDescription('');
      }
    } else {
      alert('Inserisci un nome per il progetto.');
    }
  };

  // Seleziona un progetto dall'elenco
  const handleSelectProject = (projectId) => {
    selectProject(projectId);
    setShowOpenDialog(false);
  };

  return (
    <div className="top-menu">
      <div className="menu-item">
        <span>File</span>
        <div className="dropdown-content">
          <button onClick={handleNewProject}>Nuovo</button>
          <button onClick={handleOpenProject}>Apri</button>
          <button onClick={handleSaveProject}>Salva</button>
          <button>Salva con nome</button>
        </div>
      </div>
      <div className="menu-item">
        <span>Modifica</span>
        <div className="dropdown-content">
          <button>Taglia</button>
          <button>Copia</button>
          <button>Incolla</button>
          <button>Elimina</button>
        </div>
      </div>
      <div className="menu-item">
        <span>Visualizza</span>
        <div className="dropdown-content">
          <button>Zoom In</button>
          <button>Zoom Out</button>
          <button>Adatta alla finestra</button>
        </div>
      </div>
      <div className="app-title">
        ZanFlow {currentProject ? `- ${currentProject.name}` : ''}
      </div>

      {/* Dialogo per il nuovo progetto */}
      {showNewDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Nuovo Progetto</h3>
            <div className="form-group">
              <label>Nome:</label>
              <input 
                type="text" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Inserisci nome progetto"
              />
            </div>
            <div className="form-group">
              <label>Descrizione:</label>
              <textarea 
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Inserisci descrizione (opzionale)"
                rows="3"
              />
            </div>
            <div className="dialog-buttons">
              <button onClick={confirmNewProject} disabled={loading}>
                {loading ? 'Creazione...' : 'Crea'}
              </button>
              <button onClick={() => setShowNewDialog(false)} disabled={loading}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogo per aprire un progetto */}
      {showOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Apri Progetto</h3>
            {loading ? (
              <p>Caricamento progetti in corso...</p>
            ) : projects.length === 0 ? (
              <p>Nessun progetto disponibile.</p>
            ) : (
              <ul className="projects-list">
                {projects.map(project => (
                  <li 
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={currentProject?.id === project.id ? 'selected' : ''}
                  >
                    <span>{project.name}</span>
                    <span className="project-date">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="dialog-buttons">
              <button onClick={() => setShowOpenDialog(false)} disabled={loading}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMenu;