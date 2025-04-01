import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import './ProjectManager.css';

const ProjectManager = () => {
  const { projects, currentProject, loading, error, addProject, selectProject } = useProject();
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const success = await addProject(newProjectName.trim(), newProjectDescription.trim());
    
    if (success) {
      setShowNewProjectForm(false);
      setNewProjectName('');
      setNewProjectDescription('');
    }
  };

  return (
    <div className="project-manager">
      <div className="project-header">
        <h3>Gestione Progetti</h3>
        {!showNewProjectForm && (
          <button 
            className="create-project-btn"
            onClick={() => setShowNewProjectForm(true)}
          >
            Nuovo Progetto
          </button>
        )}
      </div>
      
      {showNewProjectForm && (
        <form onSubmit={handleCreateProject} className="new-project-form">
          <div className="form-group">
            <label>Nome Progetto:</label>
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Inserisci nome progetto"
              required
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
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowNewProjectForm(false)}
              disabled={loading}
            >
              Annulla
            </button>
          </div>
        </form>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="projects-list">
        <h4>Progetti Disponibili</h4>
        {projects.length === 0 ? (
          <p>Nessun progetto disponibile. Crea un nuovo progetto.</p>
        ) : (
          <ul>
            {projects.map(project => (
              <li 
                key={project.id} 
                className={currentProject?.id === project.id ? 'selected' : ''}
                onClick={() => selectProject(project.id)}
              >
                <span className="project-name">{project.name}</span>
                <span className="project-date">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {currentProject && (
        <div className="current-project">
          <h4>Progetto Corrente</h4>
          <div className="project-details">
            <p><strong>Nome:</strong> {currentProject.name}</p>
            {currentProject.description && (
              <p><strong>Descrizione:</strong> {currentProject.description}</p>
            )}
            <p>
              <strong>Creato:</strong> {new Date(currentProject.created_at).toLocaleString()}
            </p>
            {currentProject.updated_at && (
              <p>
                <strong>Aggiornato:</strong> {new Date(currentProject.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;