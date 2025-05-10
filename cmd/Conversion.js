const { ovlcmd } = require("../lib/ovlcmd");
const fs = require("fs");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { execSync, exec } = require("child_process");
const path = require('path');
const config = require('../set');
const gTTS = require('gtts');
const axios = require('axios');
const FormData = require('form-data');
const { readFileSync } = require('fs');
const sharp = require('sharp');

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    return res.data;
  } catch (error) {
    console.error("Erreur lors de l'upload sur Catbox:", error);
    throw new Error("Une erreur est survenue lors de l'upload du fichier.");
  }
}



 const alea = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
 
const isSupportedFile = (path) => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".gif"];
    return validExtensions.some((ext) => path.endsWith(ext));
  };

ovlcmd(
  {
    nom_cmd: "url",
    classe: "Conversion",
    react: "📤",
    desc: "Upload un fichier (image, vidéo, audio) sur Catbox et renvoie le lien"
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, { text: "Veuillez mentionner un fichier (image, vidéo, audio ou document)." }, { quoted: ms });
    }

    const mediaMessage = msg_Repondu.imageMessage || msg_Repondu.videoMessage || msg_Repondu.documentMessage || msg_Repondu.audioMessage;
    if (!mediaMessage) {
      return ovl.sendMessage(ms_org, { text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou audio." }, { quoted: ms });
    }

    try {
      const media = await ovl.dl_save_media_ms(mediaMessage);
      const link = await uploadToCatbox(media);
      await ovl.sendMessage(ms_org, { text: link }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'upload sur Catbox:", error);
      await ovl.sendMessage(ms_org, { text: "Erreur lors de la création du lien Catbox." }, { quoted: ms });
    }
  }
);
  // Commande Sticker
  ovlcmd(
  {
    nom_cmd: "sticker",
    classe: "Conversion",
    react: "✍️",
    desc: "Crée un sticker à partir d'une image, vidéo ou GIF",
    alias: ["s", "stick"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, arg, ms } = cmd_options;
    
    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image, vidéo ou GIF pour créer un sticker.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_Repondu.imageMessage ||
        msg_Repondu.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image, vidéo ou GIF valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      if (!media) {
        throw new Error("Impossible de télécharger le fichier.");
      }

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: msg_Repondu.imageMessage ? 100 : 40
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker:", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Crop
ovlcmd(
  {
    nom_cmd: "crop",
    classe: "Conversion",
    react: "✂️",
    desc: "Crée un sticker croppé à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_Repondu.imageMessage ||
        msg_Repondu.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CROPPED,
        quality: 100,
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Circle
ovlcmd(
  {
    nom_cmd: "circle",
    classe: "Conversion",
    react: "🔵",
    desc: "Crée un sticker circulaire à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_Repondu.imageMessage ||
        msg_Repondu.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CIRCLE,
        quality: 100,
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Round
ovlcmd(
  {
    nom_cmd: "round",
    classe: "Conversion",
    react: "🔲",
    desc: "Crée un sticker avec des coins arrondis à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_Repondu.imageMessage ||
        msg_Repondu.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.ROUNDED,
        quality: 100,
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

  // Commande Take
  ovlcmd(
    {
      nom_cmd: "take",
      classe: "Conversion",
      react: "✍️",
      desc: "Modifie le nom d'un sticker",
    },
    async (ms_org, ovl, cmd_options) => {
      const { msg_Repondu, arg, nom_Auteur_Message, ms } = cmd_options;
      if (!msg_Repondu || !msg_Repondu.stickerMessage) {
        return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
      }
      
      try {
        const stickerBuffer = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
        const originalQuality = msg_Repondu.stickerMessage.quality || 70;
	const sticker = new Sticker(stickerBuffer, {
          pack: arg.join(' ') ? arg.join(' '): nom_Auteur_Message,
          author: "",
          type: StickerTypes.FULL,
          quality: originalQuality,
        });

        const stickerFileName = alea(".webp");
        await sticker.toFile(stickerFileName);
        await ovl.sendMessage(
          ms_org,
          { sticker: fs.readFileSync(stickerFileName) },
          { quoted: ms }
        );
        fs.unlinkSync(stickerFileName);
      } catch (error) {
        await ovl.sendMessage(ms_org, {
          text: `Erreur lors du renommage du sticker : ${error.message}`,
        }, { quoted: ms });
      }
    }
  );

    // Commande ToImage

ovlcmd(
  {
    nom_cmd: "toimage",
    classe: "Conversion",
    react: "✍️",
    desc: "Convertit un sticker en image",
    alias: ["toimg"],
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu || !msg_Repondu.stickerMessage) {
      return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
    }

    try {
      const stickerBuffer = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);

      const imageBuffer = await sharp(stickerBuffer).webp().toBuffer();

      const fileName = `${Math.floor(Math.random() * 10000)}.png`;
      await sharp(imageBuffer).toFile(fileName);

      await ovl.sendMessage(
        ms_org,
        { image: fs.readFileSync(fileName) },
        { quoted: ms }
      );

      fs.unlinkSync(fileName);
    } catch (error) {
      console.error("Erreur lors de la conversion du sticker en image:", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la conversion en image : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Write

ovlcmd(
  {
    nom_cmd: "write",
    classe: "Conversion",
    react: "✍️",
    desc: "Ajoute du texte à une image, vidéo ou sticker",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, arg, ms } = cmd_options;

    if (!msg_Repondu || !arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez répondre à un fichier et fournir du texte.",
      }, { quoted: ms });
    }

    const mediaMessage =
      msg_Repondu.imageMessage ||
      msg_Repondu.videoMessage ||
      msg_Repondu.stickerMessage;

    if (!mediaMessage) {
      return ovl.sendMessage(ms_org, {
        text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou sticker.",
      }, { quoted: ms });
    }

    try {
      const media = await ovl.dl_save_media_ms(mediaMessage);
      const image = sharp(media);
      const { width, height } = await image.metadata();

      const text = arg.join(" ").toUpperCase();
      let fontSize = Math.floor(width / 10);
      if (fontSize < 20) fontSize = 20;
      const lineHeight = fontSize * 1.2;
      const maxWidth = width * 0.8;

      function wrapText(text, maxWidth) {
        const words = text.split(" ");
        let lines = [];
        let line = "";

        words.forEach((word) => {
          let testLine = line + word + " ";
          let testWidth = testLine.length * (fontSize * 0.6);
          if (testWidth > maxWidth && line !== "") {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = testLine;
          }
        });

        lines.push(line.trim());
        return lines;
      }

      const lines = wrapText(text, maxWidth);
      const svgText = lines
        .map(
          (line, index) =>
            `<text x="50%" y="${
              height - (lines.length - index) * lineHeight
            }" font-size="${fontSize}" font-family="Arial" fill="white" text-anchor="middle" stroke="black" stroke-width="${
              fontSize / 15
            }">${line}</text>`
        )
        .join("");

      const svg = `<svg width="${width}" height="${height}">${svgText}</svg>`;
      const modifiedImage = await image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toBuffer();

      const fileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sharp(modifiedImage).webp().toFile(fileName);

      await ovl.sendMessage(ms_org, { sticker: fs.readFileSync(fileName) }, { quoted: ms }, { quoted: ms });

      fs.unlinkSync(fileName);
      fs.unlinkSync(media);
    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: `Une erreur est survenue lors de l'ajout du texte : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "remini",
    classe: "Conversion",
    react: "🖼️",
    desc: "Amélioration de la qualité des images"
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (msg_Repondu?.imageMessage) {
      try {
        const image = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
        if (!image) {
          return ovl.sendMessage(ms_org, { text: "Impossible de télécharger l'image. Réessayez." }, { quoted: ms });
        }
        const url = uploadToCatbox(image);
        const rmImage = await axios.get(`https://fastrestapis.fasturl.cloud/aiimage/upscale?resize=8&imageUrl=${url}`, {
        responseType: 'arraybuffer',
      }); 
	      
        await ovl.sendMessage(ms_org, {
          image: rmImage.data,
          caption: `\`\`\`Powered By OVL-MD\`\`\``,
        }, { quoted: ms });
      } catch (err) {
        console.error("Erreur :", err);
        return ovl.sendMessage(ms_org, {
          text: "Une erreur est survenue pendant le traitement de l'image.",
        }, { quoted: ms });
      }
    } else {
      return ovl.sendMessage(ms_org, {             
        text: "Veuillez répondre à une image pour améliorer sa qualité.",
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "emix",
    classe: "Conversion",
    react: "🌟",
    desc: "Mixes deux emojis pour créer un sticker"
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe, ms } = cmd_options;

    if (!arg || arg.length < 1) return ovl.sendMessage(ms_org, { text: `Example: ${prefixe}emix 😅;🤔` }, { quoted: ms });

let [emoji1, emoji2] = arg[0].split(';');

    try {
      let response = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
      let data = response.data;

      if (!data.results || data.results.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé pour ces emojis." }, { quoted: ms });
      }

      for (let res of data.results) {
        const imageBuffer = await axios.get(res.url, { responseType: 'arraybuffer' }).then(res => res.data);

        const sticker = new Sticker(imageBuffer, {
          pack: 'Emoji Mix Pack',
          author: 'Bot Author',
          type: StickerTypes.FULL,
          quality: 100,
        });

        const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
        await sticker.toFile(stickerFileName);

        await ovl.sendMessage(ms_org, {
          sticker: fs.readFileSync(stickerFileName),
        }, { quoted: ms });

        fs.unlinkSync(stickerFileName);
      }
    } catch (error) {
      console.error('Erreur:', error);
      return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la recherche de l'image." }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tts",
    classe: "Conversion",
    react: "🔊",
    desc: "Convertit un texte en parole et renvoie l'audio.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: `Entrez un texte à lire.`,
      }, { quoted: ms });
    }

    let lang = 'fr';
    let textToRead = arg.join(' ');

    if (arg[0].length === 2) {
      lang = arg[0];
      textToRead = arg.slice(1).join(' ');
    }

    try {
      const gtts = new gTTS(textToRead, lang);
      const audioPath = path.join(__dirname, 'output.mp3');

      gtts.save(audioPath, function (err, result) {
        if (err) {
          return ovl.sendMessage(ms_org, {
            text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
          }, { quoted: ms });
        }

        const audioBuffer = fs.readFileSync(audioPath);

        const message = {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          caption: `\`\`\`Powered By OVL-MD\`\`\``,
        };

        ovl.sendMessage(ms_org, message, { quoted: ms }).then(() => {
          fs.unlinkSync(audioPath);
        });
      });

    } catch (error) {
      return ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "attp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker animé",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, nom_Auteur_Message, ms } = cmd_options;
    if (!arg[0]) return repondre("Veuillez fournir du texte");

    const text = arg.join(' ');

    try {
      const response = await axios.get(`https://bk9.fun/maker/text2gif?q=${encodeURIComponent(text)}`, {
        responseType: 'arraybuffer',
      });

      const stickerBuffer = await new Sticker(response.data, {
        pack: text || nom_Auteur_Message,
        author: "",
        type: StickerTypes.CROPPED,
        quality: 90,
        background: "transparent",
      }).toBuffer();

      await ovl.sendMessage(ms_org, { sticker: stickerBuffer }, { quoted: ms });

    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue lors de la génération du sticker animé.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ttp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, nom_Auteur_Message, ms } = cmd_options;
    if (!arg[0]) return repondre("Veuillez fournir du texte");

    const text = arg.join(' ');

    try {
      const response = await axios.get(`https://bk9.fun/maker/text2img?q=${encodeURIComponent(text)}`, {
        responseType: 'arraybuffer',
      });

      const stickerBuffer = await new Sticker(response.data, {
        pack: text || nom_Auteur_Message,
        author: "",
        type: StickerTypes.CROPPED,
        quality: 70,
        background: "transparent",
      }).toBuffer();

      await ovl.sendMessage(ms_org, { sticker: stickerBuffer }, { quoted: ms });

    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue lors de la génération du sticker.");
    }
  }
);

async function convertWebpToMp4({ file, filename, url }) {
  if (!file && !url) throw new Error("Un fichier ou une URL est requis.");
  if (file && !filename) throw new Error("Le nom du fichier est requis pour les fichiers envoyés.");

  const form = new FormData();
  if (file) form.append("new-image", file, { filename });
  if (url) form.append("new-image-url", url);

  const uploadRes = await axios.post("https://ezgif.com/webp-to-mp4", form, {
    headers: form.getHeaders(),
  });

  const redir = uploadRes?.request?.res?.responseUrl;
  if (!redir) throw new Error("Redirection introuvable.");

  const id = redir.split("/").pop();
  const convRes = await axios.post(`${redir}?ajax=true`, new URLSearchParams({ file: id }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const html = convRes.data.toString();
  const start = "\" controls><source src=\"";
  const end = "\" type=\"video/mp4\">Your browser";
  const mp4 = html.split(start)?.[1]?.split(end)?.[0];

  if (!mp4) throw new Error("Conversion échouée.");

  return "https:" + mp4.replace("https:", "");
}

ovlcmd(
  {
    nom_cmd: "stickertovideo",
    classe: "Conversion",
    react: "🎞️",
    desc: "Convertit un sticker en vidéo MP4",
    alias: ["stovid"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms, repondre, msg_Repondu } = cmd_options;

    try {
      if (!msg_Repondu || !msg_Repondu.stickerMessage) {
        return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
      }
      const cheminFichier = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage)
      
      const stream = fs.createReadStream(cheminFichier);
      const mp4Url = await convertWebpToMp4({ file: stream, filename: "fichier.webp" });

      await ovl.sendMessage(ms_org, {
        video: { url: mp4Url },
        caption: `\`\`\`Powered By OVL-MD\`\`\``,
      }, { quoted: ms });

      fs.unlinkSync(cheminFichier);
    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue pendant la conversion.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "videotogif",
    classe: "Conversion",
    react: "🎞️",
    desc: "Convertit une vidéo en GIF (lecture automatique)",
    alias: ["vidtogif"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms, repondre, msg_Repondu } = cmd_options;

    if (!msg_Repondu || !msg_Repondu.videoMessage) {
      return repondre("Répondez à une vidéo.");
    }

    const cheminFichier = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
    if (!cheminFichier) return repondre("Vidéo non trouvée ou invalide.");

    try {
      await ovl.sendMessage(ms_org, {
        video: fs.readFileSync(cheminFichier),
        gifPlayback: true,
      }, { quoted: ms });
    } catch (err) {
      console.error(err);
      repondre("Erreur lors de l'envoi du GIF.");
    } finally {
      fs.unlinkSync(cheminFichier);
    }
  }
);
