function verifierProprietaireOuAdmin(req, res, next) {

    if (!req.utilisateur) {
        return res.status(401).json({
            message: "Utilisateur non authentifié"
        });
    }

    const idUtilisateur = Number(req.params.id);

    if (
        req.utilisateur.role === "Admin" ||
        req.utilisateur.id === idUtilisateur
    ) {
        next();
        return;
    }

    return res.status(403).json({
        message: "Vous ne pouvez modifier que votre propre profil"
    });
}

module.exports = verifierProprietaireOuAdmin;