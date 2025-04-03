// FILE: api.js
//const API_BASE = 'http://localhost:3002/api';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api';

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchNodes(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/nodes`);
  return res.json();
}

export async function createNode(data) {
  const res = await fetch(`${API_BASE}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateNode(id, data) {
  const res = await fetch(`${API_BASE}/nodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteNode(id) {
  const res = await fetch(`${API_BASE}/nodes/${id}`, {
    method: 'DELETE' });
  return res.ok;
}

export async function fetchConnections(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/connections`);
  return res.json();
}

export async function createConnection(data) {
  const res = await fetch(`${API_BASE}/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteConnection(id) {
  const res = await fetch(`${API_BASE}/connections/${id}`, {
    method: 'DELETE' });
  return res.ok;
}

export async function updateProject(id, data) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}