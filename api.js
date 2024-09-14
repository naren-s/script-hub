const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // Import PostgreSQL driver

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

// GET all documents
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

// GET a specific document by ID
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

// POST new document(s)
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


// PUT update a document
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

// DELETE a document
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
