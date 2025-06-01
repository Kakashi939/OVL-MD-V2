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

const SESSION_WA = sequelize.define("SESSION_WA", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  creds: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: "wa_sessions",
  timestamps: false,
});

(async () => {
  await SESSION_WA.sync();
  console.log("Table 'SESSION_WA' synchronisée avec succès.");
})();

async function saveSession(id, creds) {
  return await SESSION_WA.upsert({ id, creds });
}

async function getSession(id) {
  const session = await SESSION_WA.findByPk(id);
  return session ? session.creds : null;
}

async function getAllSessions() {
  const sessions = await SESSION_WA.findAll({ attributes: ['id'] });
  return sessions.map(s => s.id);
}

async function deleteSession(id) {
  return await SESSION_WA.destroy({ where: { id } });
}

module.exports = {
  saveSession,
  getSession,
  getAllSessions,
  deleteSession
};
