const verifierToken = require("../middleware/auth");

const express = require("express");
const router = express.Router();
const db = require("../db");


// ===============================
// RÉCUPÉRER UNE CONVERSATION
// ===============================

router.get(
    "/:utilisateur1/:utilisateur2",
    verifierToken,
    (req, res) => {

        const utilisateurConnecte =
            Number(req.utilisateur.id);

        const utilisateur1 =
            Number(req.params.utilisateur1);

        const utilisateur2 =
            Number(req.params.utilisateur2);


        // Vérifier que l'utilisateur connecté
        // participe bien à la conversation
        if (
            utilisateurConnecte !== utilisateur1 &&
            utilisateurConnecte !== utilisateur2 &&
            req.utilisateur.role !== "Admin"
        ) {

            return res.status(403).json({
                message:
                    "Accès interdit à cette conversation"
            });

        }


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

    }
);


// ===============================
// ENVOYER UN MESSAGE
// ===============================

router.post(
    "/",
    verifierToken,
    (req, res) => {

        const {
            expediteur_id,
            destinataire_id,
            contenu
        } = req.body;


        // L'expéditeur doit être
        // l'utilisateur connecté
        if (
            Number(expediteur_id) !==
            Number(req.utilisateur.id)
        ) {

            return res.status(403).json({
                message:
                    "Vous ne pouvez pas envoyer un message au nom d'un autre utilisateur"
            });

        }


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


        // Empêcher l'envoi à soi-même
        if (
            Number(expediteur_id) ===
            Number(destinataire_id)
        ) {

            return res.status(400).json({
                message:
                    "Vous ne pouvez pas vous envoyer un message"
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

    }
);


module.exports = router;