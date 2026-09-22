const jwt = require("jsonwebtoken");

const SECRET = "privateclub_secret_2026";

function verifierToken(req, res, next) {
    const autorisation = req.headers.authorization;

    if (!autorisation) {
        return res.status(401).json({
            message: "Token manquant"
        });
    }

    const parties = autorisation.split(" ");

    if (parties.length !== 2 || parties[0] !== "Bearer") {
        return res.status(401).json({
            message: "Format du token invalide"
        });
    }

    const token = parties[1];

    try {
        const utilisateur = jwt.verify(
            token,
            SECRET
        );

        req.utilisateur = utilisateur;

        next();

    } catch (erreur) {
        return res.status(401).json({
            message: "Token invalide ou expiré"
        });
    }
}

module.exports = verifierToken;