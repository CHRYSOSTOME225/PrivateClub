
const verifierToken = require("../middleware/auth");

const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../db");


// =====================================================
// DOSSIER DES FICHIERS
// =====================================================

const dossierUpload = path.join(
    __dirname,
    "../uploads/messages"
);

if (!fs.existsSync(dossierUpload)) {
    fs.mkdirSync(
        dossierUpload,
        {
            recursive: true
        }
    );
}


// =====================================================
// CONFIGURATION MULTER
// =====================================================

const stockage = multer.diskStorage({

    destination: (req, fichier, callback) => {

        callback(
            null,
            dossierUpload
        );

    },

    filename: (req, fichier, callback) => {

        const extension =
            path.extname(
                fichier.originalname
            );

        const nomUnique =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1000000
            ) +
            extension;

        callback(
            null,
            nomUnique
        );

    }

});


const extensionsAutorisees = [

    ".jpg",
    ".jpeg",
    ".png",
    ".webp",

    ".pdf",

    ".doc",
    ".docx",

    ".xls",
    ".xlsx",

    ".ppt",
    ".pptx",

    ".txt"

];


const upload = multer({

    storage: stockage,

    limits: {
        fileSize:
            10 * 1024 * 1024
    },

    fileFilter: (
        req,
        fichier,
        callback
    ) => {

        const extension =
            path.extname(
                fichier.originalname
            ).toLowerCase();

        if (
            extensionsAutorisees.includes(
                extension
            )
        ) {

            callback(
                null,
                true
            );

        } else {

            callback(
                new Error(
                    "Type de fichier non autorisé"
                )
            );

        }

    }

});


// =====================================================
// VÉRIFIER LES DROITS DE CONTACT
// =====================================================

function peutContacter(
    roleExpediteur,
    roleDestinataire
) {

    if (
        roleExpediteur === "Admin"
    ) {

        return true;

    }

    if (
        roleExpediteur === "Responsable"
    ) {

        return (
            roleDestinataire === "Admin" ||
            roleDestinataire === "Membre"
        );

    }

    if (
        roleExpediteur === "Membre"
    ) {

        return (
            roleDestinataire === "Responsable" ||
            roleDestinataire === "Membre"
        );

    }

    return false;

}


// =====================================================
// COMPTER LES MESSAGES NON LUS
// =====================================================

router.get(
    "/compteur",
    verifierToken,
    (req, res) => {

        const utilisateurId =
            Number(req.utilisateur.id);

        console.log(
            "COMPTEUR - utilisateur connecté :",
            req.utilisateur
        );

        console.log(
            "COMPTEUR - ID utilisé :",
            utilisateurId
        );


        const sql = `

            SELECT COUNT(*) AS nombre

            FROM messages

            WHERE
                destinataire_id = ?
                AND lu = 0

        `;


        db.query(

            sql,

            [utilisateurId],

            (err, resultats) => {

                if (err) {

                    console.error(
                        "ERREUR COMPTEUR :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors du comptage des messages non lus"

                    });

                }


                const nombre =
                    Number(
                        resultats[0]?.nombre
                    ) || 0;


                console.log(
                    "COMPTEUR - résultat :",
                    nombre
                );


                res.json({

                    nombre:
                        nombre

                });

            }

        );

    }

);


// =====================================================
// MARQUER UNE CONVERSATION COMME LUE
// =====================================================

router.put(
    "/lu/:utilisateur",
    verifierToken,
    (req, res) => {

        const utilisateurConnecte =
            Number(req.utilisateur.id);

        const autreUtilisateur =
            Number(
                req.params.utilisateur
            );


        console.log(
            "LECTURE - utilisateur connecté :",
            utilisateurConnecte
        );

        console.log(
            "LECTURE - autre utilisateur :",
            autreUtilisateur
        );


        if (
            !autreUtilisateur ||
            autreUtilisateur ===
            utilisateurConnecte
        ) {

            return res.status(400).json({

                message:
                    "Utilisateur invalide"

            });

        }


        const sql = `

            UPDATE messages

            SET lu = 1

            WHERE

                expediteur_id = ?

                AND

                destinataire_id = ?

                AND

                lu = 0

        `;


        db.query(

            sql,

            [

                autreUtilisateur,

                utilisateurConnecte

            ],

            (err, resultat) => {

                if (err) {

                    console.error(
                        "ERREUR MARQUAGE :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors du marquage des messages"

                    });

                }


                console.log(
                    "LECTURE - messages marqués :",
                    resultat.affectedRows
                );


                res.json({

                    message:
                        "Messages marqués comme lus",

                    nombre:
                        resultat.affectedRows

                });

            }

        );

    }

);


// =====================================================
// RÉCUPÉRER UNE CONVERSATION
// =====================================================

router.get(
    "/:utilisateur1/:utilisateur2",
    verifierToken,
    (req, res) => {

        const utilisateurConnecte =
            Number(req.utilisateur.id);

        const utilisateur1 =
            Number(
                req.params.utilisateur1
            );

        const utilisateur2 =
            Number(
                req.params.utilisateur2
            );


        if (
            utilisateurConnecte !== utilisateur1 &&
            utilisateurConnecte !== utilisateur2
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

                messages.fichier,

                messages.nom_fichier,

                messages.type_fichier,

                messages.date_envoi,

                messages.lu,

                expediteur.nom AS expediteur,

                destinataire.nom AS destinataire

            FROM messages

            INNER JOIN utilisateurs AS expediteur

                ON messages.expediteur_id =
                   expediteur.id

            INNER JOIN utilisateurs AS destinataire

                ON messages.destinataire_id =
                   destinataire.id

            WHERE

                (
                    messages.expediteur_id = ?
                    AND
                    messages.destinataire_id = ?
                )

                OR

                (
                    messages.expediteur_id = ?
                    AND
                    messages.destinataire_id = ?
                )

            ORDER BY
                messages.date_envoi ASC

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

                    console.error(
                        "ERREUR CONVERSATION :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors de la récupération des messages"

                    });

                }


                res.json(
                    resultats
                );

            }

        );

    }

);


// =====================================================
// ENVOYER UN MESSAGE AVEC OU SANS FICHIER
// =====================================================

router.post(
    "/",
    verifierToken,
    upload.single("fichier"),

    (req, res) => {

        const {

            expediteur_id,

            destinataire_id,

            contenu

        } = req.body;


        const fichier =
            req.file;


        // =================================================
        // VÉRIFIER L'EXPÉDITEUR
        // =================================================

        if (
            Number(expediteur_id) !==
            Number(req.utilisateur.id)
        ) {

            if (fichier) {

                fs.unlink(
                    fichier.path,
                    () => {}
                );

            }


            return res.status(403).json({

                message:
                    "Vous ne pouvez pas envoyer un message au nom d'un autre utilisateur"

            });

        }


        // =================================================
        // VÉRIFIER LE DESTINATAIRE
        // =================================================

        if (
            !expediteur_id ||
            !destinataire_id
        ) {

            if (fichier) {

                fs.unlink(
                    fichier.path,
                    () => {}
                );

            }


            return res.status(400).json({

                message:
                    "L'expéditeur et le destinataire sont obligatoires"

            });

        }


        // =================================================
        // MESSAGE ET FICHIER
        // =================================================

        const contenuFinal =
            contenu
                ? contenu.trim()
                : "";


        if (
            contenuFinal === "" &&
            !fichier
        ) {

            return res.status(400).json({

                message:
                    "Le message ou le fichier est obligatoire"

            });

        }


        // =================================================
        // EMPÊCHER L'AUTO-MESSAGE
        // =================================================

        if (
            Number(expediteur_id) ===
            Number(destinataire_id)
        ) {

            if (fichier) {

                fs.unlink(
                    fichier.path,
                    () => {}
                );

            }


            return res.status(400).json({

                message:
                    "Vous ne pouvez pas vous envoyer un message"

            });

        }


        // =================================================
        // RÉCUPÉRER LE DESTINATAIRE
        // =================================================

        const sqlUtilisateur = `

            SELECT
                id,
                role

            FROM utilisateurs

            WHERE id = ?

        `;


        db.query(

            sqlUtilisateur,

            [destinataire_id],

            (err, resultats) => {

                if (err) {

                    console.error(
                        "ERREUR DESTINATAIRE :",
                        err
                    );


                    if (fichier) {

                        fs.unlink(
                            fichier.path,
                            () => {}
                        );

                    }


                    return res.status(500).json({

                        message:
                            "Erreur lors de la vérification du destinataire"

                    });

                }


                if (
                    resultats.length === 0
                ) {

                    if (fichier) {

                        fs.unlink(
                            fichier.path,
                            () => {}
                        );

                    }


                    return res.status(404).json({

                        message:
                            "Destinataire introuvable"

                    });

                }


                const roleDestinataire =
                    resultats[0].role;


                // =============================================
                // VÉRIFIER LA HIÉRARCHIE
                // =============================================

                if (
                    !peutContacter(

                        req.utilisateur.role,

                        roleDestinataire

                    )
                ) {

                    if (fichier) {

                        fs.unlink(
                            fichier.path,
                            () => {}
                        );

                    }


                    return res.status(403).json({

                        message:
                            "Vous n'avez pas l'autorisation de contacter cet utilisateur"

                    });

                }


                // =============================================
                // CHEMIN DU FICHIER
                // =============================================

                let cheminFichier = null;

                let nomFichier = null;

                let typeFichier = null;


                if (fichier) {

                    cheminFichier =
                        "/uploads/messages/" +
                        fichier.filename;

                    nomFichier =
                        fichier.originalname;

                    typeFichier =
                        fichier.mimetype;

                }


                // =============================================
                // ENREGISTRER LE MESSAGE
                // =============================================

                const sql = `

                    INSERT INTO messages

                    (
                        expediteur_id,
                        destinataire_id,
                        contenu,
                        fichier,
                        nom_fichier,
                        type_fichier,
                        lu
                    )

                    VALUES (?, ?, ?, ?, ?, ?, 0)

                `;


                db.query(

                    sql,

                    [

                        expediteur_id,

                        destinataire_id,

                        contenuFinal,

                        cheminFichier,

                        nomFichier,

                        typeFichier

                    ],

                    (err, resultat) => {

                        if (err) {

                            console.error(
                                "ERREUR INSERT MESSAGE :",
                                err
                            );


                            if (fichier) {

                                fs.unlink(
                                    fichier.path,
                                    () => {}
                                );

                            }


                            return res.status(500).json({

                                message:
                                    "Erreur lors de l'envoi du message"

                            });

                        }


                        res.status(201).json({

                            message:
                                "Message envoyé avec succès",

                            id:
                                resultat.insertId,

                            fichier:
                                cheminFichier,

                            nom_fichier:
                                nomFichier,

                            type_fichier:
                                typeFichier

                        });

                    }

                );

            }

        );

    }

);


// =====================================================
// GESTION DES ERREURS MULTER
// =====================================================

router.use(
    (err, req, res, next) => {

        if (
            err instanceof multer.MulterError
        ) {

            if (
                err.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(413).json({

                    message:
                        "Le fichier ne doit pas dépasser 10 Mo."

                });

            }


            return res.status(400).json({

                message:
                    "Erreur lors de l'envoi du fichier."

            });

        }


        if (err) {

            return res.status(400).json({

                message:
                    err.message ||
                    "Type de fichier non autorisé."

            });

        }


        next();

    }

);


module.exports = router;

