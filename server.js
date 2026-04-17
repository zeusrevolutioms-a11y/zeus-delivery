// =========================================================
// 🚀 SERVER NODEJS MYSQL COMPLETO
// 📌 Arquivo: server.js
// =========================================================
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// =========================================================
// 📦 TABELAS
// =========================================================
(async()=>{

await db.query(`
CREATE TABLE IF NOT EXISTS usuarios(
    id VARCHAR(50) PRIMARY KEY,
    senha VARCHAR(255)
)
`);

await db.query(`
CREATE TABLE IF NOT EXISTS motoboys(
    id VARCHAR(50) PRIMARY KEY,
    lat DOUBLE,
    lng DOUBLE,
    online INT DEFAULT 0,
    updated BIGINT
)
`);


// =========================================================
// 📦 TABELA PEDIDOS
// =========================================================
await db.query(`
CREATE TABLE IF NOT EXISTS pedidos(
id INT AUTO_INCREMENT PRIMARY KEY,
codigo VARCHAR(50),
cliente VARCHAR(100),
rua VARCHAR(255),
bairro VARCHAR(100),
km VARCHAR(20),
taxa VARCHAR(20),
motoboy VARCHAR(50),
status VARCHAR(30),
created BIGINT
)
`);

console.log("📦 Banco pronto");

})();

// =========================================================
// 🧑‍💻 REGISTRO
// =========================================================
app.post('/register', async(req,res)=>{

const { id, senha } = req.body;

const [rows] = await db.query(
"SELECT * FROM usuarios WHERE id=?",[id]
);

if(rows.length > 0){
    return res.send({error:"ID já existe"});
}

await db.query(
"INSERT INTO usuarios(id,senha) VALUES(?,?)",
[id,senha]
);

res.send({status:"ok"});

});

// =========================================================
// 🔐 LOGIN
// =========================================================
app.post('/login', async(req,res)=>{

const { id, senha } = req.body;

const [rows] = await db.query(
"SELECT * FROM usuarios WHERE id=?",[id]
);

if(rows.length <= 0){
    return res.send({error:"Usuário não existe"});
}

if(rows[0].senha !== senha){
    return res.send({error:"Senha inválida"});
}

res.send({status:"ok"});

});

// =========================================================
// 📍 RECEBER LOCALIZAÇÃO
// =========================================================
app.post('/location', async(req,res)=>{

const { id, lat, lng } = req.body;

await db.query(`
INSERT INTO motoboys(id,lat,lng,online,updated)
VALUES(?,?,?,?,?)
ON DUPLICATE KEY UPDATE
lat=?,
lng=?,
online=1,
updated=?
`,[
id,lat,lng,1,Date.now(),
lat,lng,Date.now()
]);

res.send({status:"ok"});

});

// =========================================================
// 🔴 SAIR DE SERVIÇO
// =========================================================
app.post('/offline', async(req,res)=>{

const { id } = req.body;

await db.query(
"UPDATE motoboys SET online=0 WHERE id=?",
[id]
);

res.send({status:"ok"});

});

// =========================================================
// 📡 LISTAR
// =========================================================
app.get('/motoboys', async(req,res)=>{

const [rows] = await db.query(
"SELECT * FROM motoboys"
);

let resposta = {};

rows.forEach(m=>{

resposta[m.id] = {
    lat:m.lat,
    lng:m.lng,
    online:m.online == 1
};

});

res.send(resposta);

});


// =========================================================
// 🚀 SALVAR PEDIDO
// =========================================================
app.post('/pedido', async(req,res)=>{

try{

const {
codigo,
cliente,
rua,
bairro,
km,
taxa,
motoboy
} = req.body;

await db.query(`
INSERT INTO pedidos
(codigo,cliente,rua,bairro,km,taxa,motoboy,status,created)
VALUES(?,?,?,?,?,?,?,?,?)
`,[
codigo,
cliente,
rua,
bairro,
km,
taxa,
motoboy,
'aguardando',
Date.now()
]);

res.send({status:"ok"});

}catch(e){

console.log(e);
res.send({error:"erro salvar pedido"});

}

});

// =========================================================
// 🚀 START
// =========================================================
app.listen(process.env.PORT || 3000,()=>{
console.log("🔥 Servidor online");
});
