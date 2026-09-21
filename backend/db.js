const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "PrivateClub@2026",
    database: "privateclub"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à MySQL :", err.message);
        return;
    }

    console.log("✅ Connecté à MySQL !");
});

module.exports = db;