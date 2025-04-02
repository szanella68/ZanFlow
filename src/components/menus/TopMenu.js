// FILE: TopMenu.js
import React, { useState } from 'react';
import './TopMenu.css';
import { useProject } from '../../context/ProjectContext';

const TopMenu = () => {
  const { projects, selectProject, addProject, loadProjects } = useProject();
  const [showProjectList, setShowProjectList] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

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
      <button onClick={() => setShowNewDialog(true)}>Nuovo</button>
      <button onClick={handleOpenProject}>Apri</button>
      <button>Salva</button>

      {showProjectList && (
        <div className="modal">
          <h3>Seleziona un progetto</h3>
          <ul>
            {projects.map((p) => (
              <li key={p.id} onClick={() => handleSelectProject(p.id)}>
                {p.name}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowProjectList(false)}>Chiudi</button>
        </div>
      )}

      {showNewDialog && (
        <div className="modal">
          <h3>Nuovo Progetto</h3>
          <input
            type="text"
            placeholder="Nome progetto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <textarea
            placeholder="Descrizione"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
          <button onClick={confirmNewProject}>Conferma</button>
          <button onClick={() => setShowNewDialog(false)}>Annulla</button>
        </div>
      )}
    </div>
  );
};

export default TopMenu;
