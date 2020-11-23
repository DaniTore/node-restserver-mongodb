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
    urlDB = 'mongodb://localhost:27017/cafe'
    console.log('usando BBDD local');
} else {
    urlDB = process.env.MONGO_URI
    console.log('usando BBDD en Mongo - Atlas');
}
process.env.URLDB = urlDB