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

(async () => {
  await ECONOMIE.sync();
  console.log("Table 'ECONOMIE' synchronisée avec succès.");
})();

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

async function supprimerUtilisateur(jid) {
  return await ECONOMIE.destroy({ where: { id: jid } });
}

async function getInfosUtilisateur(jid) {
  const user = await ECONOMIE.findOne({ where: { id: jid } });
  if (!user) return null;
  return user.dataValues;
}

async function modifierSolde(jid, type = "portefeuille", montant = 0) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;

  if (!["portefeuille", "banque"].includes(type)) {
    throw new Error("Type de solde invalide. Utilise 'portefeuille' ou 'banque'.");
  }

  const ancienSolde = utilisateur[type];
  const valeurAbsolue = Math.abs(montant);

  const nouveauSolde = montant < 0
    ? Math.max(ancienSolde - valeurAbsolue, 0)
    : ancienSolde + valeurAbsolue;

  utilisateur[type] = nouveauSolde;
  await utilisateur.save();

  return { nouveauSolde };
}

async function mettreAJourCapaciteBanque(jid, nouvelleCapacite) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;
  utilisateur.capacite_banque = nouvelleCapacite;
  await utilisateur.save();
  return utilisateur.capacite_banque;
}

async function changerPseudo(jid, nouveauPseudo) {
  const utilisateur = await ECONOMIE.findOne({ where: { id: jid } });
  if (!utilisateur) return null;
  utilisateur.pseudo = nouveauPseudo;
  await utilisateur.save();
  return utilisateur.pseudo;
}

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
