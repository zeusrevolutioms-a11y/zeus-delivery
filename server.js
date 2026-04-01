// ================================
// 🚀 ROTA SPEED SERVER COM BANCO REAL
// ================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ================================
// 🧠 BANCO SQLITE
// ================================
const db = new sqlite3.Database('./database.db');

// criar tabelas
db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    senha TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS motoboys (
    id TEXT PRIMARY KEY,
    lat REAL,
    lng REAL,
    updated INTEGER
)
`);

// ================================
// 🧑‍💻 CADASTRO
// ================================
app.post('/register', (req, res) => {
    const { id, senha } = req.body;

    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
        if (row) {
            return res.send({ error: "ID já existe" });
        }

        db.run("INSERT INTO usuarios (id, senha) VALUES (?, ?)", [id, senha]);

        res.send({ status: "ok" });
    });
});

// ================================
// 🔐 LOGIN
// ================================
app.post('/login', (req, res) => {
    const { id, senha } = req.body;

    db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, user) => {
        if (!user || user.senha !== senha) {
            return res.send({ error: "Login inválido" });
        }

        res.send({ status: "ok" });
    });
});

// ================================
// 📍 LOCALIZAÇÃO
// ================================
app.post('/location', (req, res) => {
    const { id, lat, lng } = req.body;

    db.run(`
        INSERT INTO motoboys (id, lat, lng, updated)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        lat=excluded.lat,
        lng=excluded.lng,
        updated=excluded.updated
    `, [id, lat, lng, Date.now()]);

    res.send({ status: 'ok' });
});

// ================================
// 📡 LISTAR + ONLINE/OFFLINE
// ================================
app.get('/motoboys', (req, res) => {

    db.all("SELECT * FROM motoboys", [], (err, rows) => {

        const agora = Date.now();
        let resposta = {};

        rows.forEach(m => {
            const online = (agora - m.updated) < 10000;

            resposta[m.id] = {
                lat: m.lat,
                lng: m.lng,
                online
            };
        });

        res.send(resposta);
    });
});

// ================================
app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 SERVER rodando com banco REAL');
});
