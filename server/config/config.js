// =====================
// Puero
// =====================
process.env.PORT = process.env.PORT || 8080;

// =====================
// Entorno
// =====================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =====================
// Base de Datos
// =====================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
    console.log('usando BBDD local');
} else {
    urlDB = process.env.MONGO_URI;
    console.log('usando BBDD en Mongo - Atlas');
}
process.env.URLDB = urlDB;

// =====================
// Vencimiento del Token
// =====================
// 60 minutos
// 60 segundos
// 24 horas 
// 30 dias 

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// =====================
// SEED de autenticacion
// =====================

process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'esto-es-el-seed-desarrollo';

// =====================
// GOOGLE CLIENT ID 
// =====================

process.env.CLIENT_ID = process.env.CLIENT_ID || '721182421873-8dclbgjjgv4g2vuharb7tv490j29keho.apps.googleusercontent.com';