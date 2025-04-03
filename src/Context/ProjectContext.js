// FILE: ProjectContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createProject as createProjectAPI } from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Errore caricamento progetti:', err);
    }
  };

  const selectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project);

    fetch(`/api/projects/${projectId}/nodes`)
      .then(res => res.json())
      .then(setNodes)
      .catch(err => console.error('Errore caricamento nodi:', err));
  };

  const addProject = async (newProjectData) => {
    try {
      const savedProject = await createProjectAPI(newProjectData);
      setProjects((prev) => [...prev, savedProject]);
      setCurrentProject(savedProject);
      setNodes([]);
    } catch (error) {
      console.error('Errore durante la creazione del progetto:', error);
    }
  };

  const value = {
    projects,
    currentProject,
    nodes,
    setProjects,
    selectProject,
    setNodes,
    setCurrentProject,
    addProject,
    loadProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
