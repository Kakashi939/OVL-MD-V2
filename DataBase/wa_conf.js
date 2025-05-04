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

const WA_CONF = sequelize.define(
  "WA_CONF",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    presence: {
      type: DataTypes.STRING,
      defaultValue: "rien",
    },
    lecture_status: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    like_status: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    dl_status : {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antivv: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antidelete: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    mention: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
  },
  {
    tableName: "wa_conf",
    timestamps: false,
  }
);

(async () => {
  await WA_CONF.sync();
  console.log("Table 'WA_CONF' synchronisée avec succès.");
})();

module.exports = { WA_CONF };
