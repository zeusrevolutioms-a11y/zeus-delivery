const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
app.get('/motoboy', (req, res) => {
    res.sendFile(__dirname + '/public/motoboy/index.html');
});

app.get('/motoboy/index.html', (req, res) => {
    res.sendFile(__dirname + '/public/motoboy/index.html');
});
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 📦 Banco
const db = new sqlite3.Database('./database.db');

// 🧱 Criar tabela
db.run(`
CREATE TABLE IF NOT EXISTS motoboys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    sobrenome TEXT,
    telefone TEXT UNIQUE,
    senha TEXT,
    criado_em TEXT
)
`);

// 📍 Localizações
let locations = {};

// 🧾 Cadastro
app.post('/register', async (req, res) => {
    const { nome, sobrenome, telefone, senha } = req.body;

    if (!nome || !sobrenome || !telefone || !senha) {
        return res.send({ error: 'Preencha tudo' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const data = new Date().toISOString();

    db.run(
        `INSERT INTO motoboys (nome, sobrenome, telefone, senha, criado_em)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, sobrenome, telefone, hash, data],
        function (err) {
            if (err) {
                return res.send({ error: 'Telefone já cadastrado' });
            }

            res.send({ status: 'ok' });
        }
    );
});

// 🔐 Login
app.post('/login', (req, res) => {
    const { telefone, senha } = req.body;

    db.get(
        `SELECT * FROM motoboys WHERE telefone = ?`,
        [telefone],
        async (err, user) => {
            if (!user) return res.send({ error: 'Conta não encontrada' });

            const match = await bcrypt.compare(senha, user.senha);

            if (!match) return res.send({ error: 'Senha incorreta' });

            res.send({
                status: 'ok',
                user: {
                    id: user.id,
                    nome: user.nome,
                    sobrenome: user.sobrenome
                }
            });
        }
    );
});

// 📍 Atualizar localização
app.post('/location', (req, res) => {
    const { id, lat, lng, nome } = req.body;

    locations[id] = { lat, lng, nome };

    res.send({ status: 'ok' });
});

// 📡 Listar
app.get('/motoboys', (req, res) => {
    res.send(locations);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 Server rodando');
});
