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

const GroupSettings = sequelize.define(
  "GroupSettings",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    welcome: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    goodbye: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antipromote: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antidemote: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
  },
  {
    tableName: "group_settings",
    timestamps: false,
  }
);

(async () => {
  await GroupSettings.sync();
  console.log("Table 'GroupSettings' synchronisée avec succès.");
})();

module.exports = { GroupSettings };
