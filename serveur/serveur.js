const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require("cors");
const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const csvFilePath = path.join(__dirname, '../data/users.csv');
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'nom', title: 'Nom' },
        { id: 'email', title: 'Email' },
        { id: 'username', title: 'Username' },
        { id: 'password', title: 'Password' },
        { id: 'role', title: 'Role' }
    ],
    append: true
});

const contactCsvPath = path.join(__dirname, '../data/contacts.csv');
const contactCsvWriter = createCsvWriter({
    path: contactCsvPath,
    header: [
        { id: 'nom', title: 'Nom' },
        { id: 'prenom', title: 'Prénom' },
        { id: 'telephone', title: 'Téléphone' },
        { id: 'email', title: 'Email' },
        { id: 'adresse', title: 'Adresse' },
        { id: 'message', title: 'Message' }
    ],
    append: true
});

app.post('/contact', (req, res) => {
    const { name, surname, phone, email, address, message } = req.body;

    const contact = [{ nom: name, prenom: surname, telephone: phone, email, adresse: address, message: message }];

    contactCsvWriter.writeRecords(contact)
        .then(() => {
            res.status(200).send('Message envoyé avec succès.');
        })
        .catch(err => {
            res.status(500).send('Erreur lors de l\'envoi du message.');
        });
});



app.post('/ajouter', (req, res) => {
    const { nom, email, username, password, role } = req.body;

    const user = [{ nom, email, username, password, role }];

    csvWriter.writeRecords(user)
        .then(() => {
            res.status(200).json({ message: 'Utilisateur sauvegardé avec succès' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
        });

});
app.get('/liste', (req, res) => {
    const users = [];

    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', () => {
            res.status(200).json(users);
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});
app.put('/update/:username', (req, res) => {
    const { username } = req.params;
    const { nom, email, password, role } = req.body;
    const updatedUser = { nom, email, username, password, role };

    const users = [];
    let headers = [];

    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('headers', (headerList) => {
            console.log(headerList)
            headers = headerList; 
        })
        .on('data', (row) => {
            if (row.username === username) {
                users.push(updatedUser);
            } else {
                users.push(row);
            }
        })
        .on('end', () => {
            const csvWriter = createCsvWriter({
                path: csvFilePath,
                header: headers.map(header => ({ id: header, title: header }))
            });

            csvWriter.writeRecords(users)
                .then(() => {
                    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
                });
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});
app.delete('/delete/:username', (req, res) => {
    const { username } = req.params;
    const users = [];
    let headers = [];

    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('headers', (headerList) => {
            headers = headerList; 
        })
        .on('data', (row) => {
            if (row.username !== username) {
                users.push(row);
            }
        })
        .on('end', () => {
            const csvWriter = createCsvWriter({
                path: csvFilePath,
                header: headers.map(header => ({ id: header, title: header })) 
            });

            csvWriter.writeRecords(users)
                .then(() => {
                    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
                });
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const users = [];

    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', () => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                res.status(200).json({ error: false, user });
            } else {
                res.status(401).json({ error: true, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});

//Gestion des produits

const produitCsvFilePath = path.join(__dirname, '../data/products.csv');
const produitCsvWriter = createCsvWriter({
    path: produitCsvFilePath,
    header: [
        { id: 'categorie', title: 'Categorie' },
        { id: 'nom', title: 'Nom' },
        { id: 'image', title: 'Image' },
        { id: 'description', title: 'Description' },
        { id: 'prix', title: 'Prix' },
        { id: 'type', title: 'Type' }
    ],
    append: true
});

// Route pour ajouter un produit dans le fichier CSV des produits
app.post('/ajouter-produit', (req, res) => {
    const { categorie, nom, image, description, prix, type } = req.body;

    const produit = [{ categorie, nom, image, description, prix, type }];

    produitCsvWriter.writeRecords(produit)
        .then(() => {
            res.status(200).json({ message: 'Produit sauvegardé avec succès' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Erreur lors de l\'ajout du produit' });
        });
});

// Route pour obtenir la liste des produits depuis le fichier CSV
app.get('/liste-produits', (req, res) => {
    const produits = [];

    fs.createReadStream(produitCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            produits.push(row);
        })
        .on('end', () => {
            res.status(200).json(produits);
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});

// Route pour mettre à jour les informations d'un produit spécifique
app.put('/update-produit/:nom', (req, res) => {
    const { nom } = req.params;
    const { categorie, image, description, prix, type } = req.body;
    const updatedProduit = { categorie, nom, image, description, prix, type };

    const produits = [];

    fs.createReadStream(produitCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            if (row.nom === nom) {
                produits.push(updatedProduit);
            } else {
                produits.push(row);
            }
        })
        .on('end', () => {
            produitCsvWriter.writeRecords(produits)
                .then(() => {
                    res.status(200).json({ message: 'Produit mis à jour avec succès' });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
                });
        });
});

// Route pour supprimer un produit spécifique du fichier CSV
app.delete('/delete-produit/:nom', (req, res) => {
    const { nom } = req.params;
    const produits = [];

    fs.createReadStream(produitCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            if (row.nom !== nom) {
                produits.push(row);
            }
        })
        .on('end', () => {
            produitCsvWriter.writeRecords(produits)
                .then(() => {
                    res.status(200).json({ message: 'Produit supprimé avec succès' });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
                });
        });
});

const usersCsvFilePath = path.join(__dirname, '../data/users.csv');

// Route pour obtenir les informations du vendeur depuis le fichier CSV
app.get('/vendeur-info/:username', (req, res) => {
    const { username } = req.params;
    let vendeurInfo = null;

    fs.createReadStream(usersCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            if (row.username === username) {
                vendeurInfo = row;
            }
        })
        .on('end', () => {
            if (vendeurInfo) {
                res.status(200).json(vendeurInfo);
            } else {
                res.status(404).json({ message: 'Vendeur non trouvé' });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ message: 'Erreur lors de la lecture du fichier CSV' });
        });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`); 
});