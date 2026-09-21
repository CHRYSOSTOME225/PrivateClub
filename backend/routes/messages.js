const express = require("express");
const router = express.Router();
const db = require("../db");

// GET : récupérer les messages entre deux utilisateurs
router.get("/:utilisateur1/:utilisateur2", (req, res) => {

    const utilisateur1 = req.params.utilisateur1;
    const utilisateur2 = req.params.utilisateur2;

    const sql = `
        SELECT
            messages.id,
            messages.expediteur_id,
            messages.destinataire_id,
            messages.contenu,
            messages.date_envoi,
            expediteur.nom AS expediteur,
            destinataire.nom AS destinataire
        FROM messages

        INNER JOIN utilisateurs AS expediteur
            ON messages.expediteur_id = expediteur.id

        INNER JOIN utilisateurs AS destinataire
            ON messages.destinataire_id = destinataire.id

        WHERE
            (
                messages.expediteur_id = ?
                AND messages.destinataire_id = ?
            )
            OR
            (
                messages.expediteur_id = ?
                AND messages.destinataire_id = ?
            )

        ORDER BY messages.date_envoi ASC
    `;

    db.query(
        sql,
        [
            utilisateur1,
            utilisateur2,
            utilisateur2,
            utilisateur1
        ],
        (err, resultats) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Erreur lors de la récupération des messages"
                });

            }

            res.json(resultats);

        }
    );

});


// POST : envoyer un message
router.post("/", (req, res) => {

    const {
        expediteur_id,
        destinataire_id,
        contenu
    } = req.body;


    if (
        !expediteur_id ||
        !destinataire_id ||
        !contenu ||
        contenu.trim() === ""
    ) {

        return res.status(400).json({
            message:
                "Tous les champs sont obligatoires"
        });

    }


    const sql = `
        INSERT INTO messages
        (
            expediteur_id,
            destinataire_id,
            contenu
        )
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [
            expediteur_id,
            destinataire_id,
            contenu.trim()
        ],
        (err, resultat) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Erreur lors de l'envoi du message"
                });

            }


            res.status(201).json({

                message:
                    "Message envoyé avec succès",

                id:
                    resultat.insertId

            });

        }
    );

});


module.exports = router;