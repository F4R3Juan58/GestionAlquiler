const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializa la base de datos
const db = new sqlite3.Database('./alquileres.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err);
  } else {
    console.log('Base de datos conectada.');

    // Crea la tabla si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        piso_id INTEGER,
        fecha TEXT,
        fecha_fin TEXT,
        nombre TEXT,
        telefono TEXT,
        coste REAL
      )
    `);
    
  }
});

// Endpoint para obtener las reservas de un piso
app.get('/api/pisos/:id/reservas', (req, res) => {
  const pisoId = req.params.id;
  db.all('SELECT * FROM reservas WHERE piso_id = ?', [pisoId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      console.log('Reservas encontradas:', rows); // 👈 Añade esto
      res.json(rows);
    }
  });
});


// Endpoint para crear una reserva
app.post('/api/pisos/:id/reservas', (req, res) => {
  const pisoId = req.params.id;
  const { fecha, fecha_fin, nombre, telefono, coste } = req.body;
  db.run(
    `INSERT INTO reservas (piso_id, fecha, fecha_fin, nombre, telefono, coste)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [pisoId, fecha, fecha_fin, nombre, telefono, coste],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});


// Endpoint para borrar una reserva
app.delete('/api/pisos/:id/reservas/:reservaId', (req, res) => {
  const reservaId = req.params.reservaId;
  db.run('DELETE FROM reservas WHERE id = ?', [reservaId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Reserva eliminada' });
    }
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
