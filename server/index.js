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
  database: 'zanflow_db'
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
    res.status(201).json({ id: result.insertId, name, description });
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
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating node', error);
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