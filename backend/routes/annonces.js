
const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../db");

const verifierToken = require("../middleware/auth");
const verifierAdmin = require("../middleware/admin");


// =====================================================
// DOSSIER DES FICHIERS D'ANNONCES
// =====================================================

const dossierAnnonces = path.join(
    __dirname,
    "../uploads/annonces"
);

if (!fs.existsSync(dossierAnnonces)) {
    fs.mkdirSync(
        dossierAnnonces,
        {
            recursive: true
        }
    );
}


// =====================================================
// CONFIGURATION MULTER
// =====================================================

const stockage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            dossierAnnonces
        );

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const nomOriginal =
            path.basename(
                file.originalname,
                extension
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );

        const nomFichier =
            `annonce-${Date.now()}-${nomOriginal}${extension}`;

        cb(
            null,
            nomFichier
        );

    }

});


// =====================================================
// TYPES DE FICHIERS AUTORISÉS
// =====================================================

const typesAutorises = [

    // Images
    "image/jpeg",
    "image/png",
    "image/webp",

    // PDF
    "application/pdf",

    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Texte
    "text/plain"

];


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


// =====================================================
// FILTRE DES FICHIERS
// =====================================================

const filtreFichier = (req, file, cb) => {

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    const typeAutorise =
        typesAutorises.includes(
            file.mimetype
        );

    const extensionAutorisee =
        extensionsAutorisees.includes(
            extension
        );

    if (
        typeAutorise &&
        extensionAutorisee
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Type de fichier non autorisé."
            ),
            false
        );

    }

};


// =====================================================
// CONFIGURATION UPLOAD
// =====================================================

const uploadFichier = multer({

    storage: stockage,

    fileFilter: filtreFichier,

    limits: {

        fileSize:
            10 * 1024 * 1024

    }

});


// =====================================================
// GET — RÉCUPÉRER LES ANNONCES
// =====================================================

router.get(
    "/",
    verifierToken,
    (req, res) => {

        const sql = `

            SELECT

                annonces.id,
                annonces.titre,
                annonces.contenu,
                annonces.auteur_id,
                annonces.date_creation,
                annonces.fichier,
                annonces.nom_fichier,
                annonces.type_fichier,

                utilisateurs.nom AS auteur

            FROM annonces

            LEFT JOIN utilisateurs

                ON annonces.auteur_id =
                   utilisateurs.id

            ORDER BY
                annonces.date_creation DESC

        `;

        db.query(
            sql,
            (err, resultats) => {

                if (err) {

                    console.error(
                        "ERREUR MYSQL ANNONCES :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors de la récupération des annonces."

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
// POST — CRÉER UNE ANNONCE
// ADMIN UNIQUEMENT
// =====================================================

router.post(
    "/",
    verifierToken,
    verifierAdmin,
    uploadFichier.single("fichier"),
    (req, res) => {

        const {
            titre,
            contenu
        } = req.body;


        // =============================================
        // VÉRIFICATION DU TITRE
        // =============================================

        if (
            !titre ||
            titre.trim() === ""
        ) {

            if (req.file) {

                fs.unlink(
                    req.file.path,
                    () => {}
                );

            }

            return res.status(400).json({

                message:
                    "Le titre de l'annonce est obligatoire."

            });

        }


        // =============================================
        // VÉRIFICATION DU CONTENU
        // =============================================

        if (
            !contenu ||
            contenu.trim() === ""
        ) {

            if (req.file) {

                fs.unlink(
                    req.file.path,
                    () => {}
                );

            }

            return res.status(400).json({

                message:
                    "Le contenu de l'annonce est obligatoire."

            });

        }


        // =============================================
        // INFORMATIONS DU FICHIER
        // =============================================

        let cheminFichier = null;
        let nomFichier = null;
        let typeFichier = null;


        if (req.file) {

            cheminFichier =
                `/uploads/annonces/${req.file.filename}`;

            nomFichier =
                req.file.originalname;

            typeFichier =
                req.file.mimetype;

        }


        // =============================================
        // INSERTION MYSQL
        // =============================================

        const sql = `

            INSERT INTO annonces

            (
                titre,
                contenu,
                auteur_id,
                fichier,
                nom_fichier,
                type_fichier
            )

            VALUES (?, ?, ?, ?, ?, ?)

        `;


        const valeurs = [

            titre.trim(),

            contenu.trim(),

            req.utilisateur.id,

            cheminFichier,

            nomFichier,

            typeFichier

        ];


        db.query(
            sql,
            valeurs,
            (err, resultat) => {

                if (err) {

                    console.error(
                        "ERREUR MYSQL CREATION ANNONCE :",
                        err
                    );


                    if (req.file) {

                        fs.unlink(
                            req.file.path,
                            () => {}
                        );

                    }


                    return res.status(500).json({

                        message:
                            "Erreur lors de la création de l'annonce."

                    });

                }


                res.status(201).json({

                    message:
                        "Annonce publiée avec succès.",

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


// =====================================================
// GET — OUVRIR UN FICHIER D'ANNONCE
// UTILISATEUR CONNECTÉ
// =====================================================

router.get(
    "/fichier/:id",
    verifierToken,
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Identifiant d'annonce invalide."

            });

        }


        const sql = `

            SELECT
                fichier,
                nom_fichier,
                type_fichier

            FROM annonces

            WHERE id = ?

        `;


        db.query(
            sql,
            [id],
            (err, resultats) => {

                if (err) {

                    console.error(
                        "ERREUR MYSQL FICHIER ANNONCE :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors de la récupération du fichier."

                    });

                }


                if (
                    resultats.length === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Annonce introuvable."

                    });

                }


                const annonce =
                    resultats[0];


                if (
                    !annonce.fichier
                ) {

                    return res.status(404).json({

                        message:
                            "Cette annonce ne contient aucun fichier."

                    });

                }


                const nomFichier =
                    path.basename(
                        annonce.fichier
                    );


                const cheminComplet =
                    path.join(
                        dossierAnnonces,
                        nomFichier
                    );


                if (
                    !fs.existsSync(
                        cheminComplet
                    )
                ) {

                    return res.status(404).json({

                        message:
                            "Le fichier est introuvable sur le serveur."

                    });

                }


                res.setHeader(
                    "Content-Type",
                    annonce.type_fichier ||
                    "application/octet-stream"
                );


                res.setHeader(
                    "Content-Disposition",
                    `inline; filename="${encodeURIComponent(
                        annonce.nom_fichier || nomFichier
                    )}"`
                );


                res.sendFile(
                    cheminComplet
                );

            }
        );

    }
);


// =====================================================
// DELETE — SUPPRIMER UNE ANNONCE
// ADMIN UNIQUEMENT
// =====================================================

router.delete(
    "/:id",
    verifierToken,
    verifierAdmin,
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Identifiant d'annonce invalide."

            });

        }


        const rechercheSql = `

            SELECT
                fichier

            FROM annonces

            WHERE id = ?

        `;


        db.query(
            rechercheSql,
            [id],
            (err, resultats) => {

                if (err) {

                    console.error(
                        "ERREUR RECHERCHE ANNONCE :",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Erreur lors de la recherche de l'annonce."

                    });

                }


                if (
                    resultats.length === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Annonce introuvable."

                    });

                }


                const fichier =
                    resultats[0].fichier;


                const suppressionSql = `

                    DELETE FROM annonces

                    WHERE id = ?

                `;


                db.query(
                    suppressionSql,
                    [id],
                    (errSuppression) => {

                        if (errSuppression) {

                            console.error(
                                "ERREUR SUPPRESSION ANNONCE :",
                                errSuppression
                            );

                            return res.status(500).json({

                                message:
                                    "Erreur lors de la suppression de l'annonce."

                            });

                        }


                        // =================================
                        // SUPPRIMER LE FICHIER DU SERVEUR
                        // =================================

                        if (fichier) {

                            const nomFichier =
                                path.basename(
                                    fichier
                                );


                            const cheminComplet =
                                path.join(
                                    dossierAnnonces,
                                    nomFichier
                                );


                            if (
                                fs.existsSync(
                                    cheminComplet
                                )
                            ) {

                                fs.unlink(
                                    cheminComplet,
                                    (erreur) => {

                                        if (erreur) {

                                            console.error(
                                                "ERREUR SUPPRESSION FICHIER :",
                                                erreur
                                            );

                                        }

                                    }
                                );

                            }

                        }


                        res.json({

                            message:
                                "Annonce supprimée avec succès."

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

                return res.status(400).json({

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

            console.error(
                "ERREUR UPLOAD ANNONCE :",
                err
            );


            return res.status(400).json({

                message:
                    err.message ||
                    "Fichier non autorisé."

            });

        }


        next();

    }
);


module.exports = router;

