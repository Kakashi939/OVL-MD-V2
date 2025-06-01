const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');
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

const Mention = sequelize.define('Mention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  mode: {
    type: DataTypes.STRING,
    defaultValue: 'non',
  },
  url: {
    type: DataTypes.TEXT,
    defaultValue: 'url',
  },
  text: {
    type: DataTypes.TEXT,
    defaultValue: 'text',
  },
}, {
  tableName: 'mention',
  timestamps: false,
});

(async () => {
  await Mention.sync();
  console.log("Table 'Mention' synchronisée avec succès.");
})();

async function setMention({ url = "url", text = "text", mode = "non" }) {
  await Mention.upsert({
    id: 1,
    url,
    text,
    mode,
  });
}

async function delMention() {
  await Mention.destroy({ where: { id: 1 } });
}

async function getMention() {
  return await Mention.findOne({ where: { id: 1 } });
}

module.exports = { setMention, delMention, getMention };
