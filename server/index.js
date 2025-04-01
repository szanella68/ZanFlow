const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurazione del database
const dbConfig = {
  host: 'localhost',
  user: 'root',  // Sostituisci con il tuo username
  password: '',  // Sostituisci con la tua password
  database: 'zanflow'
};

// Pool di connessioni
let pool;
async function initializePool() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('Database connection pool initialized');
  } catch (error) {
    console.error('Error initializing database pool', error);
  }
}

initializePool();

// API Endpoints

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO projects (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description, created_at: new Date(), updated_at: new Date() });
  } catch (error) {
    console.error('Error creating project', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Nodes
app.get('/api/projects/:projectId/nodes', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM nodes WHERE project_id = ?',
      [projectId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching nodes', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/nodes', async (req, res) => {
  try {
    const { project_id, node_type, name, position_x, position_y, data } = req.body;
    const [result] = await pool.query(
      'INSERT INTO nodes (project_id, node_type, name, position_x, position_y, data) VALUES (?, ?, ?, ?, ?, ?)',
      [project_id, node_type, name, position_x, position_y, JSON.stringify(data)]
    );
    res.status(201).json({ 
      id: result.insertId, 
      project_id, 
      node_type, 
      name, 
      position_x, 
      position_y, 
      data, 
      created_at: new Date(), 
      updated_at: new Date() 
    });
  } catch (error) {
    console.error('Error creating node', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Aggiunto endpoint per aggiornare i nodi
app.put('/api/nodes/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { name, position_x, position_y, data } = req.body;
    
    // Aggiorna solo i campi forniti
    let query = 'UPDATE nodes SET updated_at = NOW()';
    const params = [];
    
    if (name !== undefined) {
      query += ', name = ?';
      params.push(name);
    }
    
    if (position_x !== undefined) {
      query += ', position_x = ?';
      params.push(position_x);
    }
    
    if (position_y !== undefined) {
      query += ', position_y = ?';
      params.push(position_y);
    }
    
    if (data !== undefined) {
      query += ', data = ?';
      params.push(JSON.stringify(data));
    }
    
    query += ' WHERE id = ?';
    params.push(nodeId);
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    // Recupera il nodo aggiornato
    const [updatedNode] = await pool.query('SELECT * FROM nodes WHERE id = ?', [nodeId]);
    
    res.json(updatedNode[0]);
  } catch (error) {
    console.error('Error updating node', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connections
app.get('/api/projects/:projectId/connections', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM connections WHERE project_id = ?',
      [projectId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching connections', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/connections', async (req, res) => {
  try {
    const { project_id, start_node_id, end_node_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO connections (project_id, start_node_id, end_node_id) VALUES (?, ?, ?)',
      [project_id, start_node_id, end_node_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating connection', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});