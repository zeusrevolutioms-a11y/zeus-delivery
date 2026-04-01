const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // 👈 importante pra abrir HTML

let motoboys = {};

// 📍 Atualizar localização
app.post('/location', (req, res) => {
    const { id, lat, lng } = req.body;

    motoboys[id] = { lat, lng };

    res.send({ status: 'ok' });
});

// 📡 Listar
app.get('/motoboys', (req, res) => {
    res.send(motoboys);
});

// ⚠️ porta dinâmica (Render precisa disso)
app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 SERVER rodando');
});