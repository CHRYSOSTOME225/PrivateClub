const db = require("./db");

db.query("SELECT 1", (err, result) => {
    if (err) {
        console.error("❌ Erreur :", err.message);
        return;
    }

    console.log("✅ MySQL fonctionne !");
    console.log(result);
    db.end();
});