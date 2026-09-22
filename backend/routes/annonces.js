const verifierToken = require("../middleware/auth");
const verifierAdmin = require("../middleware/admin");

const express = require("express");
const router = express.Router();
const db = require("../db");

// ===============================
// RÉCUPÉRER TOUTES LES ANNONCES
// ===============================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            annonces.id,
            annonces.titre,
            annonces.contenu,
            annonces.auteur_id,
            annonces.date_creation,
            utilisateurs.nom AS auteur
        FROM annonces
        INNER JOIN utilisateurs
        ON annonces.auteur_id = utilisateurs.id
        ORDER BY annonces.date_creation DESC
    `;

    db.query(sql, (err, resultats) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                message:
                    "Erreur lors de la récupération des annonces"
            });

        }

        res.json(resultats);

    });

});


// ===============================
// CRÉER UNE ANNONCE
// ===============================

router.post(
    "/",
    verifierToken,
    verifierAdmin,
    (req, res) => {

        const {
            titre,
            contenu
        } = req.body;


        if (
            !titre ||
            !contenu ||
            titre.trim() === "" ||
            contenu.trim() === ""
        ) {

            return res.status(400).json({
                message:
                    "Le titre et le contenu sont obligatoires"
            });

        }


        // L'auteur est automatiquement
        // l'Admin connecté.
        const auteur_id =
            req.utilisateur.id;


        const sql = `
            INSERT INTO annonces
            (
                titre,
                contenu,
                auteur_id
            )
            VALUES (?, ?, ?)
        `;


        db.query(
            sql,
            [
                titre.trim(),
                contenu.trim(),
                auteur_id
            ],
            (err, resultat) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Erreur lors de la création de l'annonce"
                    });

                }


                res.status(201).json({

                    message:
                        "Annonce créée avec succès",

                    id:
                        resultat.insertId

                });

            }
        );

    }
);


// ===============================
// SUPPRIMER UNE ANNONCE
// ===============================

router.delete(
    "/:id",
    verifierToken,
    verifierAdmin,
    (req, res) => {

        const id = req.params.id;


        db.query(
            "DELETE FROM annonces WHERE id = ?",
            [id],
            (err, resultat) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Erreur lors de la suppression de l'annonce"
                    });

                }


                if (
                    resultat.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Annonce introuvable"
                    });

                }


                res.json({

                    message:
                        "Annonce supprimée avec succès"

                });

            }
        );

    }
);


module.exports = router;