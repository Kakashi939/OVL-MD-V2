const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  PREFIXE: process.env.PREFIXE || "",
  NOM_OWNER: process.env.NOM_OWNER || "Ainz",
  NUMERO_OWNER: process.env.NUMERO_OWNER || "",
  MODE: process.env.MODE || "public",
  MENU: process.env.MENU || "https://i.ibb.co/ynx9QcZ/image.jpg",
  SESSION_ID: process.env.SESSION_ID || "ovl",
  LEVEL_UP: process.env.LEVEL_UP || "non",
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Wa-sticker",
  STICKER_AUTHOR_NAME: process.env.STICKER_AUTHOR_NAME || "OVL-MD",
  DATABASE: process.env.DATABASE,
  RENDER_API_KEY: process.env.RENDER_API_KEY,
};
