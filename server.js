// ================================
// 🚀 ROTA SPEED SERVER
// ================================

const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 📦 "banco fake" (depois vira Mongo/Postgres)
let motoboys = {};
let usuarios = {};

// ================================
// 🧑‍💻 CADASTRO
// ================================
app.post('/register', (req, res) => {
    const { id, senha } = req.body;

    if (usuarios[id]) {
        return res.send({ error: "ID já existe" });
    }

    usuarios[id] = { senha };

    res.send({ status: "ok" });
});

// ================================
// 🔐 LOGIN
// ================================
app.post('/login', (req, res) => {
    const { id, senha } = req.body;

    if (!usuarios[id] || usuarios[id].senha !== senha) {
        return res.send({ error: "Login inválido" });
    }

    res.send({ status: "ok" });
});

// ================================
// 📍 LOCALIZAÇÃO
// ================================
app.post('/location', (req, res) => {
    const { id, lat, lng } = req.body;

    motoboys[id] = {
        lat,
        lng,
        updated: Date.now()
    };

    res.send({ status: 'ok' });
});

// ================================
// 📡 LISTAR + STATUS ONLINE
// ================================
app.get('/motoboys', (req, res) => {

    const agora = Date.now();

    let resposta = {};

    for (let id in motoboys) {
        const m = motoboys[id];

        const online = (agora - m.updated) < 10000; // 10s

        resposta[id] = {
            ...m,
            online
        };
    }

    res.send(resposta);
});

// ================================
app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 SERVER rodando');
});
