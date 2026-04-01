//----------------------------------------------------------------------------------------------------------------------
// 🚀 ROTA SPEED - SERVER COMPLETO (COM LOGIN)
//----------------------------------------------------------------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const DB = './users.json';

//----------------------------------------------------------------------------------------------------------------------
// 📦 BANCO
//----------------------------------------------------------------------------------------------------------------------

function getUsers(){
    if(!fs.existsSync(DB)) return [];
    return JSON.parse(fs.readFileSync(DB));
}

function saveUsers(data){
    fs.writeFileSync(DB, JSON.stringify(data,null,2));
}

//----------------------------------------------------------------------------------------------------------------------
// 📝 REGISTRAR
//----------------------------------------------------------------------------------------------------------------------

app.post('/register',(req,res)=>{
    const { nome, telefone, senha, pergunta, resposta } = req.body;

    let users = getUsers();

    const id = Date.now().toString();

    users.push({ id, nome, telefone, senha, pergunta, resposta });

    saveUsers(users);

    res.send({ success:true });
});

//----------------------------------------------------------------------------------------------------------------------
// 🔐 LOGIN
//----------------------------------------------------------------------------------------------------------------------

app.post('/login',(req,res)=>{
    const { telefone, senha } = req.body;

    let users = getUsers();

    const user = users.find(u => u.telefone === telefone && u.senha === senha);

    if(!user) return res.send({ error:true });

    res.send({ success:true, user });
});

//----------------------------------------------------------------------------------------------------------------------
// ❓ PERGUNTA
//----------------------------------------------------------------------------------------------------------------------

app.post('/get-question',(req,res)=>{
    const { telefone } = req.body;

    let users = getUsers();

    const user = users.find(u => u.telefone === telefone);

    if(!user) return res.send({ error:true });

    res.send({ pergunta:user.pergunta });
});

//----------------------------------------------------------------------------------------------------------------------
// 🔑 RECUPERAR SENHA
//----------------------------------------------------------------------------------------------------------------------

app.post('/recover',(req,res)=>{
    const { telefone, resposta, novaSenha } = req.body;

    let users = getUsers();

    const user = users.find(u => u.telefone === telefone && u.resposta === resposta);

    if(!user) return res.send({ error:true });

    user.senha = novaSenha;

    saveUsers(users);

    res.send({ success:true });
});

//----------------------------------------------------------------------------------------------------------------------
// 📍 SEU SISTEMA ORIGINAL (INTOCADO)
//----------------------------------------------------------------------------------------------------------------------

let motoboys = {};

app.post('/location', (req, res) => {
    const { id, lat, lng } = req.body;

    if (!id) {
        return res.status(400).send({ error: 'ID obrigatório' });
    }

    motoboys[id] = {
        lat,
        lng,
        updated_at: new Date()
    };

    res.send({ status: 'ok' });
});

app.get('/motoboys', (req, res) => {
    res.send(motoboys);
});

//----------------------------------------------------------------------------------------------------------------------

app.listen(process.env.PORT || 3000, () => {
    console.log('🔥 ROTA SPEED rodando COMPLETO');
});
