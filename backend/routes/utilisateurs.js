const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");


// ===============================
// RÉCUPÉRER TOUS LES UTILISATEURS
// ===============================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            id,
            nom,
            email,
            role,
            departement,
            poste,
            telephone,
            photo,
            date_creation
        FROM utilisateurs
        ORDER BY id ASC
    `;

    db.query(sql, (err, resultats) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                message:
                    "Erreur lors de la récupération des utilisateurs"
            });

        }

        res.json(resultats);

    });

});


// ===============================
// RÉCUPÉRER UN UTILISATEUR PAR ID
// ===============================

router.get("/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            id,
            nom,
            email,
            role,
            departement,
            poste,
            telephone,
            photo,
            date_creation
        FROM utilisateurs
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, resultats) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Erreur lors de la récupération du profil"
                });

            }

            if (resultats.length === 0) {

                return res.status(404).json({
                    message:
                        "Utilisateur introuvable"
                });

            }

            res.json(resultats[0]);

        }
    );

});


// ===============================
// AJOUTER UN UTILISATEUR
// ===============================

router.post("/", async (req, res) => {

    const {
        nom,
        email,
        motDePasse,
        role,
        departement
    } = req.body;


    if (
        !nom ||
        !email ||
        !motDePasse ||
        !role ||
        !departement
    ) {

        return res.status(400).json({
            message:
                "Tous les champs sont obligatoires"
        });

    }


    try {

        const motDePasseHash =
            await bcrypt.hash(
                motDePasse,
                10
            );


        const sql = `
            INSERT INTO utilisateurs
            (
                nom,
                email,
                mot_de_passe,
                role,
                departement
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                nom,
                email,
                motDePasseHash,
                role,
                departement
            ],
            (err, resultat) => {

                if (err) {

                    console.error(err);

                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            message:
                                "Cette adresse email est déjà utilisée."
                        });

                    }


                    return res.status(500).json({
                        message:
                            "Erreur lors de la création du membre"
                    });

                }


                res.status(201).json({

                    message:
                        "Membre créé avec succès",

                    id:
                        resultat.insertId

                });

            }
        );

    } catch (erreur) {

        console.error(erreur);

        res.status(500).json({
            message:
                "Erreur serveur"
        });

    }

});


// ===============================
// MODIFIER UN UTILISATEUR
// ===============================

router.put("/:id", async (req, res) => {

    const id = req.params.id;

    const {
        nom,
        email,
        motDePasse,
        role,
        departement,
        telephone,
        poste,
        photo
    } = req.body;


    if (
        !nom ||
        !email ||
        !role ||
        !departement
    ) {

        return res.status(400).json({
            message:
                "Les champs obligatoires sont manquants"
        });

    }


    try {

        let sql;
        let valeurs;


        // ===============================
        // AVEC NOUVEAU MOT DE PASSE
        // ===============================

        if (
            motDePasse &&
            motDePasse.trim() !== ""
        ) {

            const motDePasseHash =
                await bcrypt.hash(
                    motDePasse,
                    10
                );


            sql = `
                UPDATE utilisateurs
                SET
                    nom = ?,
                    email = ?,
                    mot_de_passe = ?,
                    role = ?,
                    departement = ?,
                    telephone = ?,
                    poste = ?,
                    photo = ?
                WHERE id = ?
            `;


            valeurs = [
                nom,
                email,
                motDePasseHash,
                role,
                departement,
                telephone || "",
                poste || "",
                photo || "",
                id
            ];

        } else {


            // ===============================
            // SANS CHANGER LE MOT DE PASSE
            // ===============================

            sql = `
                UPDATE utilisateurs
                SET
                    nom = ?,
                    email = ?,
                    role = ?,
                    departement = ?,
                    telephone = ?,
                    poste = ?,
                    photo = ?
                WHERE id = ?
            `;


            valeurs = [
                nom,
                email,
                role,
                departement,
                telephone || "",
                poste || "",
                photo || "",
                id
            ];

        }


        db.query(
            sql,
            valeurs,
            (err, resultat) => {

                if (err) {

                    console.error(err);


                    if (
                        err.code === "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            message:
                                "Cette adresse email est déjà utilisée."
                        });

                    }


                    return res.status(500).json({
                        message:
                            "Erreur lors de la modification"
                    });

                }


                if (
                    resultat.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Utilisateur introuvable"
                    });

                }


                res.json({

                    message:
                        "Utilisateur modifié avec succès"

                });

            }
        );

    } catch (erreur) {

        console.error(erreur);

        res.status(500).json({
            message:
                "Erreur serveur"
        });

    }

});


// ===============================
// SUPPRIMER UN UTILISATEUR
// ===============================

router.delete("/:id", (req, res) => {

    const id = req.params.id;


    db.query(
        "DELETE FROM utilisateurs WHERE id = ?",
        [id],
        (err, resultat) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Erreur lors de la suppression"
                });

            }


            if (
                resultat.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        "Utilisateur introuvable"
                });

            }


            res.json({

                message:
                    "Utilisateur supprimé avec succès"

            });

        }
    );

});


module.exports = router;