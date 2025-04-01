const API_URL = 'http://localhost:3002/api';

export const fetchProjects = async () => {
  const response = await fetch(`${API_URL}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return await response.json();
};

export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return await response.json();
};

export const fetchNodes = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/nodes`);
  if (!response.ok) {
    throw new Error('Failed to fetch nodes');
  }
  return await response.json();
};

export const createNode = async (nodeData) => {
  const response = await fetch(`${API_URL}/nodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nodeData),
  });
  if (!response.ok) {
    throw new Error('Failed to create node');
  }
  return await response.json();
};

export const updateNode = async (nodeId, nodeData) => {
  const response = await fetch(`${API_URL}/nodes/${nodeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nodeData),
  });
  if (!response.ok) {
    throw new Error('Failed to update node');
  }
  return await response.json();
};

export const fetchConnections = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/connections`);
  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }
  return await response.json();
};

export const createConnection = async (connectionData) => {
  const response = await fetch(`${API_URL}/connections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(connectionData),
  });
  if (!response.ok) {
    throw new Error('Failed to create connection');
  }
  return await response.json();
};