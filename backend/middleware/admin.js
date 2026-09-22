function verifierAdmin(req, res, next) {

    if (!req.utilisateur) {
        return res.status(401).json({
            message: "Utilisateur non authentifié"
        });
    }

    if (req.utilisateur.role !== "Admin") {
        return res.status(403).json({
            message: "Accès réservé à l'Admin"
        });
    }

    next();
}

module.exports = verifierAdmin;