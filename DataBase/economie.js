const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
const db = config.DATABASE;

let sequelize;
if (!db) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.db',
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  });
}

// Définition de la table "ECONOMIE"
const ECONOMIE = sequelize.define(
  "ECONOMIE",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    pseudo: {
      type: DataTypes.STRING,
      defaultValue: "Utilisateur",
    },
    portefeuille: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    banque: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    capacite_banque: {
      type: DataTypes.INTEGER,
      defaultValue: 10000,
    },
  },
  {
    tableName: "economie",
    timestamps: false,
  }
);

// Synchronisation de la table
(async () => {
  await ECONOMIE.sync();
  console.log("Table 'ECONOMIE' synchronisée avec succès.");
})();

// ✅ 1. Ajouter un utilisateur
async function ajouterUtilisateur(jid, pseudo = "Utilisateur") {
  return await ECONOMIE.findOrCreate({
    where: { id: jid },
    defaults: {
      pseudo,
      portefeuille: 0,
      banque: 0,
      capacite_banque: 1000,
    },
  });
}

// ✅ 2. Supprimer un utilisateur
async function supprimerUtilisateur(jid) {
  return await ECONOMIE.destroy({ where: { id: jid } });
}

// ✅ 3. Obtenir les infos d'un utilisateur
async function getInfosUtilisateur(jid) {
  const user = await ECONOMIE.findOne({ where: { id: jid } });
  if (!user) return null;
  return user.dataValues;
}

// ✅ 4. Ajouter ou retirer de l'argent (wallet ou banque)
async function modifierSolde(jid, type = "portefeuille", montant = 0) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;

  if (type !== "portefeuille" && type !== "banque") {
    throw new Error("Type de solde invalide. Utilise 'portefeuille' ou 'banque'.");
  }

  utilisateur[type] += montant;
  if (utilisateur[type] < 0) utilisateur[type] = 0;
  await utilisateur.save();
  return utilisateur[type];
}

// ✅ 5. Mettre à jour la capacité de la banque
async function mettreAJourCapaciteBanque(jid, nouvelleCapacite) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;
  utilisateur.capacite_banque = nouvelleCapacite;
  await utilisateur.save();
  return utilisateur.capacite_banque;
}

// ✅ 6. Mettre à jour le pseudo
async function changerPseudo(jid, nouveauPseudo) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;
  utilisateur.pseudo = nouveauPseudo;
  await utilisateur.save();
  return utilisateur.pseudo;
}

// ✅ 7. Réinitialiser un ou plusieurs champs (portefeuille, banque, capacité banque)
async function resetEconomie(jid, options = { wallet: false, banque: false, capacite: false }) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;

  if (options.wallet) utilisateur.portefeuille = 0;
  if (options.banque) utilisateur.banque = 0;
  if (options.capacite) utilisateur.capacite_banque = 10000;

  await utilisateur.save();
  return utilisateur.dataValues;
}

module.exports = {
  ajouterUtilisateur,
  supprimerUtilisateur,
  getInfosUtilisateur,
  modifierSolde,
  mettreAJourCapaciteBanque,
  changerPseudo,
  resetEconomie
};
