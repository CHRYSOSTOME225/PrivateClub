const bcrypt = require("bcryptjs");

const motDePasse = "test123";

bcrypt.hash(motDePasse, 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("Mot de passe haché :");
    console.log(hash);
});