const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// PostgreSQL database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'naren',
    port: 5432 // Default PostgreSQL port
});

// USER AUTHENTICATION ROUTES

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await pool.connect();
        await client.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        client.release();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        client.release();

        if (user && await bcrypt.compare(password, user.password)) {
            // Simple password authentication: no token or session
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(400).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DOCUMENT ROUTES

// GET all documents (No authentication required)
app.get('/documents', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM documents');
        const documents = result.rows;
        client.release();
        res.json(documents);
    } catch (err) {
        console.error('Error fetching documents:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET a specific document by ID (No authentication required)
app.get('/documents/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM documents WHERE id = $1', [id]);
        const document = result.rows[0];
        client.release();
        if (document) {
            res.json(document);
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (err) {
        console.error('Error fetching document by ID:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST new document(s) (No authentication required)
app.post('/documents', async (req, res) => {
    const documents = Array.isArray(req.body) ? req.body : [req.body]; // Handle single document or array

    const client = await pool.connect();

    try {
        const insertedDocuments = [];

        for (const doc of documents) {
            const { title, module, approval, scriptLink } = doc;

            const result = await client.query(
                'INSERT INTO documents (title, module, approval, script_link) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, module, approval, scriptLink]
            );

            insertedDocuments.push(result.rows[0]);
        }

        res.status(201).json(insertedDocuments);
    } catch (err) {
        console.error('Error adding new documents:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
});

// PUT update a document (No authentication required)
app.put('/documents/:id', async (req, res) => {
    const id = req.params.id;
    const { title, module, approval, scriptLink } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE documents SET title = $1, module = $2, approval = $3, script_link = $4 WHERE id = $5 RETURNING *',
            [title, module, approval, scriptLink, id]
        );
        const updatedDocument = result.rows[0];
        client.release();
        if (updatedDocument) {
            res.json(updatedDocument);
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (err) {
        console.error('Error updating document:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE a document (No authentication required)
app.delete('/documents/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM documents WHERE id = $1', [id]);
        const deletedCount = result.rowCount;
        client.release();
        if (deletedCount > 0) {
            res.json({ message: 'Document deleted successfully' });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (err) {
        console.error('Error deleting document:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Example of a public route
app.get('/dashboard', async (req, res) => {
    res.json({ message: 'Welcome to the dashboard!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
