// ================================
// 🚀 ROTA SPEED SERVER
// ================================

const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // frontend

// 📦 memória (depois vamos trocar por banco)
let motoboys = {};

// 📍 receber localização
app.post('/location', (req, res) => {
    const { id, lat, lng } = req.body;

    motoboys[id] = {
        lat,
        lng,
        updated: Date.now()
    };

    res.send({ status: 'ok' });
});

// 📡 listar motoboys
app.get('/motoboys', (req, res) => {
    res.send(motoboys);
});

// ❤️ status servidor
app.get('/', (req, res) => {
    res.send("ROTA SPEED ONLINE 🚀");
});

// ⚠️ render
app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 SERVER rodando');
});
