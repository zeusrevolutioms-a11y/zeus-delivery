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
tentativas INT DEFAULT 0,
created BIGINT,
updated BIGINT
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
// 📡 LISTAR MOTOBOYS REAL
// =========================================================
app.get('/motoboys', async(req,res)=>{

const agora = Date.now();

/* tolerância real */
const limite = agora - 90000;

const [rows] = await db.query(`
SELECT id,lat,lng,online,updated
FROM motoboys
`);

let resposta = {};

rows.forEach(m=>{

let ativo = false;

/* só fica offline se desligou manual
ou sumiu muito tempo */
if(m.online == 1 && m.updated >= limite){
ativo = true;
}

resposta[m.id] = {
lat: Number(m.lat),
lng: Number(m.lng),
online: ativo
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
(codigo,cliente,rua,bairro,km,taxa,motoboy,status,tentativas,created,updated)
VALUES(?,?,?,?,?,?,?,?,?,?,?)
`,[
codigo,
cliente,
rua,
bairro,
km,
taxa,
motoboy,
'aguardando',
0,
Date.now(),
Date.now()
]);

res.send({status:"ok"});

}catch(e){

console.log(e);
res.send({error:"erro salvar pedido"});

}

});

// =========================================================
// 🟢 ACEITAR PEDIDO
// =========================================================
app.post('/pedido/aceitar', async(req,res)=>{

const { id } = req.body;

await db.query(
"UPDATE pedidos SET status='aceito', updated=? WHERE id=?",
[Date.now(),id]
);

res.send({status:"ok"});
});

// =========================================================
// 🔴 RECUSAR PEDIDO
// =========================================================
app.post('/pedido/recusar', async(req,res)=>{

const { id } = req.body;

await db.query(
"UPDATE pedidos SET status='recusado', updated=? WHERE id=?",
[Date.now(),id]
);

res.send({status:"ok"});
});

// =========================================================
// 📦 LISTAR PEDIDOS
// =========================================================
// =========================================================
// 📦 LISTAR PEDIDOS DEBUG
// =========================================================
app.get('/pedidos', async(req,res)=>{

try{

const [rows] = await db.query(`
SELECT * FROM pedidos
ORDER BY id DESC
LIMIT 30
`);

res.json(rows);

}catch(e){

console.log("ERRO /pedidos:", e);

res.status(500).json({
erro:true,
mensagem:e.message
});

}

});


// =========================================================
// 🔁 LOOP AUTOMÁTICO REENVIO
// =========================================================
setInterval(async()=>{

try{

const [rows] = await db.query(`
SELECT * FROM pedidos
WHERE status='aguardando'
`);

for(const p of rows){

const tempo = Date.now() - p.updated;

if(tempo < 60000) continue; // 1 minuto

// busca online
const [motos] = await db.query(`
SELECT id FROM motoboys
WHERE online=1 AND id<>?
LIMIT 1
`,[p.motoboy]);

if(motos.length <= 0){

await db.query(`
UPDATE pedidos
SET status='sem_online', updated=?
WHERE id=?
`,[Date.now(),p.id]);

continue;
}

await db.query(`
UPDATE pedidos
SET motoboy=?,
tentativas=tentativas+1,
updated=?
WHERE id=?
`,[
motos[0].id,
Date.now(),
p.id
]);

}

}catch(e){
console.log("loop pedidos:",e);
}

},15000);



// =========================================================
// 🚀 START
// =========================================================
app.listen(process.env.PORT || 3000,()=>{
console.log("🔥 Servidor online");
});
