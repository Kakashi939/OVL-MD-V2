const { ovlcmd } = require("../framework/ovlcmd");
const { fbdl, ttdl, igdl, twitterdl, ytdl } = require("../framework/dl");
const ytsr = require('@distube/ytsr');
const axios = require('axios');
const { search, download } = require("aptoide_scrapper_fixed");
const fs = require("fs");
const path = require("path");

const tmp = path.join(__dirname, "../temp");
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

async function sendMedia(ms_org, ovl, url, format, type, ms) {
  try {
    const downloadLink = await axios.get(`https://glad-atlanta-ovl-9417f8d8.koyeb.app/ovl-yt-dl?url=${url}&format=${format}`);
    
    if (!downloadLink.data.url) {
      throw new Error("Le lien de téléchargement est introuvable.");
    }

    const fileName = `media_${Date.now()}.${format === "weba" ? "mp3" : "mp4"}`;
    const filePath = path.join(tmp, fileName);
 
    const response = await axios({
      method: 'GET',
      url: downloadLink.data.url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
 
    const message = {
      [type]: { url: filePath },
      mimetype: format === "weba" ? "audio/mpeg" : "video/mp4",
      caption: `\`\`\`Powered By OVL-MD\`\`\``
    };

    await ovl.sendMessage(ms_org, message, { quoted: ms });
 
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Erreur lors de l'envoi du média:", error.message);
    throw error;
  }
}

ovlcmd(
    {
        nom_cmd: "song",
        classe: "Telechargement",
        react: "🎵",
        desc: "Télécharge une chanson depuis YouTube avec un terme de recherche",
        alias: ["play"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        if (!arg.length) {
            return await ovl.sendMessage(ms_org, {
                text: "Veuillez spécifier un titre de chanson ou un lien YouTube.",
            }, { quoted: ms });
        }

        const query = arg.join(" ");
        try {
            const searchResults = await ytsr(query, { limit: 1 });
            if (searchResults.items.length === 0) {
                return await ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé." }, { quoted: ms });
            }

            const song = searchResults.items[0];
            const videoInfo = {
                url: song.url,
                title: song.name,
                views: song.views,
                duration: song.duration,
                thumbnail: song.thumbnail,
            };

            const caption = `╭─── 〔 OVL-MD SONG 〕 ──⬣\n⬡ Titre: ${videoInfo.title}\n⬡ URL: ${videoInfo.url}\n⬡ Vues: ${videoInfo.views}\n⬡ Durée: ${videoInfo.duration}\n╰───────────────────⬣`;

            await ovl.sendMessage(ms_org, { image: { url: videoInfo.thumbnail }, caption }, { quoted: ms });

            await sendMedia(ms_org, ovl, videoInfo.url, "weba", "audio", ms);
        } catch (error) {
            console.error("Erreur Song Downloader:", error.message);
            await ovl.sendMessage(ms_org, { text: "Erreur lors du téléchargement." }, { quoted: ms });
        }
    }
);
// Commande 1: Recherche et téléchargement de vidéo depuis YouTube
ovlcmd(
    {
        nom_cmd: "video",
        classe: "Telechargement",
        react: "🎥",
        desc: "Télécharge une vidéo depuis YouTube avec un terme de recherche",
    },
    async (ms_org, ovl, cmd_options) => {
        const { repondre, arg, ms } = cmd_options;

        if (!arg.length) {
            return await ovl.sendMessage(ms_org, {
                text: "Veuillez spécifier un titre de vidéo ou un lien YouTube.",
            }, { quoted: ms });
        }

        const query = arg.join(" ");
        try {
            const searchResults = await ytsr(query, { limit: 1 });
            if (searchResults.items.length === 0) {
                return await ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé pour cette recherche." }, { quoted: ms });
            }

            const video = searchResults.items[0];
            const videoInfo = {
                url: video.url,
                title: video.name,
                views: video.views,
                duration: video.duration,
                thumbnail: video.thumbnail,
            };

            const caption = `╭─── 〔 OVL-MD VIDEO 〕 ──⬣\n⬡ Titre: ${videoInfo.title}\n⬡ URL: ${videoInfo.url}\n⬡ Vues: ${videoInfo.views}\n⬡ Durée: ${videoInfo.duration}\n╰───────────────────⬣`;

            await ovl.sendMessage(ms_org, {
                image: { url: videoInfo.thumbnail },
                caption: caption,
            }, { quoted: ms });
            await sendMedia(ms_org, ovl, video.url, "mp4", "video", ms);
        } catch (error) {
            await ovl.sendMessage(ms_org, {
                text: "Une erreur est survenue lors du traitement de votre commande.",
            }, { quoted: ms });
        }
    }
);

// Commande pour télécharger l'audio
ovlcmd(
  {
    nom_cmd: "yta",
    classe: "Telechargement",
    react: "🎧",
    desc: "Télécharger de l'audio depuis YouTube à l\'aide d'un lien",
    alias: ["ytmp3"],
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");
    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo YouTube, par exemple : yta https://www.youtube.com/watch?v=abcd1234",
      }, { quoted: ms });
    }

    try {
      await sendMedia(ms_org, ovl, videoLink, "weba", "audio", ms);
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
    }
  }
);

// Commande pour télécharger la vidéo
ovlcmd(
  {
    nom_cmd: "ytv",
    classe: "Telechargement",
    react: "🎬",
    desc: "Télécharger une vidéo depuis YouTube à l\'aide d'un lien ",
    alias: ["ytmp4"],
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");
    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo YouTube, par exemple : ytv https://www.youtube.com/watch?v=abcd1234",
      }, { quoted: ms });
    }

    try {
      await sendMedia(ms_org, ovl, videoLink, "mp4", "video", ms);
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "fbdl",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger ou envoyer directement une vidéo depuis Facebook en HD"
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");
    
    if (!videoLink) {
      return ovl.sendMessage(ms_org, { text: "Veuillez fournir un lien vidéo, par exemple : fbdl https://www.facebook.com/video-link" }, { quoted: ms });
    }

    try {
      const videoDownloadLink = await fbdl(videoLink);
      const response = await axios.get(videoDownloadLink, { responseType: 'arraybuffer' });
      const videoBuffer = Buffer.from(response.data);

      return ovl.sendMessage(ms_org, { video: videoBuffer, caption: `\`\`\`Powered By OVL-MD\`\`\`` }, { quoted: ms });

    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error('Error:', error);
      return ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ttdl",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger ou envoyer directement une vidéo depuis TikTok"
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");
    
    if (!videoLink) {
      return ovl.sendMessage(ms_org, { text: "Veuillez fournir un lien vidéo TikTok, par exemple : ttdl https://vm.tiktok.com/..." }, { quoted: ms });
    }

    try {
      const downloadLinks = await ttdl(videoLink);

      const video = await axios.get(downloadLinks.result.nowatermark, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });

      return ovl.sendMessage(ms_org, { video: Buffer.from(video.data), caption: `\`\`\`Powered By OVL-MD\`\`\`` }, { quoted: ms });

    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error}` }, { quoted: ms });
      console.error('Error:', error);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "igdl",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger ou envoyer directement une vidéo depuis Instagram",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");

    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo Instagram, par exemple : igdl https://www.instagram.com/reel/...",
      }, { quoted: ms });
    }
    try {
      const downloadLinks = await igdl(videoLink);
      const video = await axios.get(downloadLinks.result.video, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
	    
      return ovl.sendMessage(ms_org, {
        video: Buffer.from(video.data),
        caption: `\`\`\`Powered By OVL-MD\`\`\``
      }, { quoted: ms });
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error("Error:", error);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "twitterdl",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger ou envoyer directement une vidéo depuis Twitter",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const videoLink = arg.join(" ");

    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo Twitter, par exemple : twitterdl https://twitter.com/...",
      }, { quoted: ms });
    }

    try {
      const downloadLinks = await twitterdl(videoLink);

      const video = await axios.get(downloadLinks.result.video, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });

      return ovl.sendMessage(ms_org, {
        video: Buffer.from(video.data),
        caption: `\`\`\`Powered By OVL-MD\`\`\``
      }, { quoted: ms });
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error("Error:", error);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "app",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger une application depuis Aptoide",
  },  
  async (ms_org, ovl, cmd_options) => {
    const { repondre, arg, ms } = cmd_options;

    try {
      const appName = arg.join(' ');
      if (!appName) {
        return repondre("*Entrer le nom de l'application à rechercher*");
      }

      const searchResults = await search(appName);

      if (searchResults.length === 0) {
        return repondre("*Application non existante, veuillez entrer un autre nom*");
      }

      const appData = await download(searchResults[0].id);
      const fileSize = parseInt(appData.size);

      if (isNaN(fileSize)) {
        return repondre("*Erreur dans la taille du fichier*");
      }

      if (fileSize > 300) {
        return repondre("Le fichier dépasse 300 Mo, impossible de le télécharger.");
      }

      const downloadLink = appData.dllink;
      const captionText =
        "『 *ᴏᴠʟ-ᴍᴅ ᴀᴘᴋ-ᴅʟ* 』\n\n*📱ɴᴏᴍ :* " + appData.name +
        "\n*🆔ɪᴅ :* " + appData["package"] +
        "\n*📅ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ:* " + appData.lastup +
        "\n*📦ᴛᴀɪʟʟᴇ :* " + appData.size +
        "\n";

      const apkFileName = (appData?.["name"] || "Downloader") + ".apk";
      const filePath = apkFileName;

      const response = await axios.get(downloadLink, { 'responseType': "stream" });
      const fileWriter = fs.createWriteStream(filePath);
      response.data.pipe(fileWriter);

      await new Promise((resolve, reject) => {
        fileWriter.on('finish', resolve);
        fileWriter.on("error", reject);
      });

      const documentMessage = {
        'document': fs.readFileSync(filePath),
        'mimetype': 'application/vnd.android.package-archive',
        'fileName': apkFileName
      };

      ovl.sendMessage(ms_org, { image: { url: appData.icon }, caption: captionText }, { quoted: ms });
      ovl.sendMessage(ms_org, documentMessage, { quoted: ms });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Erreur lors du traitement de la commande apk:', error);
      repondre("*Erreur lors du traitement de la commande apk*");
    }
  }
);
