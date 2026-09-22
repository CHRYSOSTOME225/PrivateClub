const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const SECRET = "privateclub_secret_2026";


// ===============================
// CONNEXION
// ===============================

router.post("/", async (req, res) => {

    const {
        email,
        motDePasse
    } = req.body;


    // ===============================
    // VÉRIFICATION DES CHAMPS
    // ===============================

    if (
        !email ||
        !motDePasse ||
        email.trim() === "" ||
        motDePasse.trim() === ""
    ) {

        return res.status(400).json({
            message:
                "Email et mot de passe obligatoires"
        });

    }


    const emailNormalise =
        email.trim().toLowerCase();


    // ===============================
    // RECHERCHER L'UTILISATEUR
    // ===============================

    const sql = `
        SELECT *
        FROM utilisateurs
        WHERE email = ?
    `;


    db.query(
        sql,
        [emailNormalise],
        async (err, resultats) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Erreur serveur"
                });

            }


            // ===============================
            // UTILISATEUR INTROUVABLE
            // ===============================

            if (
                resultats.length === 0
            ) {

                return res.status(401).json({
                    message:
                        "Email ou mot de passe incorrect"
                });

            }


            const utilisateur =
                resultats[0];


            // ===============================
            // VÉRIFICATION DU MOT DE PASSE
            // ===============================

            try {

                const motDePasseCorrect =
                    await bcrypt.compare(
                        motDePasse,
                        utilisateur.mot_de_passe
                    );


                if (!motDePasseCorrect) {

                    return res.status(401).json({
                        message:
                            "Email ou mot de passe incorrect"
                    });

                }


                // ===============================
                // CRÉATION DU TOKEN JWT
                // ===============================

                const token =
                    jwt.sign(
                        {
                            id:
                                utilisateur.id,

                            role:
                                utilisateur.role
                        },
                        SECRET,
                        {
                            expiresIn:
                                "2h"
                        }
                    );


                // ===============================
                // RÉPONSE
                // ===============================

                res.json({

                    message:
                        "Connexion réussie",

                    token:
                        token,

                    utilisateur: {

                        id:
                            utilisateur.id,

                        nom:
                            utilisateur.nom,

                        email:
                            utilisateur.email,

                        role:
                            utilisateur.role,

                        departement:
                            utilisateur.departement,

                        poste:
                            utilisateur.poste,

                        telephone:
                            utilisateur.telephone,

                        photo:
                            utilisateur.photo

                    }

                });

            } catch (erreur) {

                console.error(
                    "Erreur bcrypt :",
                    erreur
                );

                return res.status(500).json({
                    message:
                        "Erreur lors de la vérification du mot de passe"
                });

            }

        }
    );

});


module.exports = router;