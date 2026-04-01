const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ================================
// 🧠 CRIAR TABELAS AUTOMÁTICO (MYSQL)
// ================================
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id VARCHAR(50) PRIMARY KEY,
                senha VARCHAR(255)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS motoboys (
                id VARCHAR(50) PRIMARY KEY,
                lat DOUBLE,
                lng DOUBLE,
                updated BIGINT
            )
        `);

        console.log('📦 Tabelas prontas');

    } catch (err) {
        console.log(err);
    }
})();

// ================================
// 🧑‍💻 CADASTRO
// ================================
app.post('/register', async (req, res) => {
    const { id, senha } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);

        if (rows.length > 0) {
            return res.send({ error: "ID já existe" });
        }

        await db.query("INSERT INTO usuarios (id, senha) VALUES (?, ?)", [id, senha]);

        res.send({ status: "ok" });

    } catch (err) {
        console.log(err);
        res.send({ error: "Erro no servidor" });
    }
});

// ================================
// 🔐 LOGIN
// ================================
app.post('/login', async (req, res) => {
    const { id, senha } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);

        const user = rows[0];

        if (!user || user.senha !== senha) {
            return res.send({ error: "Login inválido" });
        }

        res.send({ status: "ok" });

    } catch (err) {
        console.log(err);
        res.send({ error: "Erro no servidor" });
    }
});

// ================================
// 📍 LOCALIZAÇÃO
// ================================
app.post('/location', async (req, res) => {
    const { id, lat, lng } = req.body;

    try {
        await db.query(`
            INSERT INTO motoboys (id, lat, lng, updated)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            lat = VALUES(lat),
            lng = VALUES(lng),
            updated = VALUES(updated)
        `, [id, lat, lng, Date.now()]);

        res.send({ status: 'ok' });

    } catch (err) {
        console.log(err);
        res.send({ error: "Erro ao salvar localização" });
    }
});

// ================================
// 📡 LISTAR MOTOBOYS
// ================================
app.get('/motoboys', async (req, res) => {

    try {
        const [rows] = await db.query("SELECT * FROM motoboys");

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

    } catch (err) {
        console.log(err);
        res.send({ error: "Erro ao listar" });
    }
});

// ================================
app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 SERVER MYSQL RODANDO');
});
