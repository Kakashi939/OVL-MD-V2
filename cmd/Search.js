const { ovlcmd, cmd } = require("../lib/ovlcmd");
const axios = require('axios');
const gis = require("g-i-s");
const wiki = require('wikipedia');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const config = require('../set');
const { translate } = require('@vitalets/google-translate-api');
const ytsr = require('@distube/ytsr');
const LyricsFinder = require('@faouzkk/lyrics-finder');
const { search, download } = require("aptoide_scrapper_fixed");
const FormData = require('form-data');

ovlcmd(
    {
        nom_cmd: "img",
        classe: "Search",
        react: "🔍",
        desc: "Recherche d'images"
    },
    async (ms_org, ovl, cmd_options) => {
      const { arg, ms } = cmd_options;
        const searchTerm = arg.join(" ");
        if (!searchTerm) {
            return ovl.sendMessage(ms_org, { text: "Veuillez fournir un terme de recherche, par exemple : img ovl-Md" },  { quoted: ms });
        }

        gis(searchTerm, async (error, results) => {
            if (error) {
                console.error("Erreur lors de la recherche d'images:", error);
                return ovl.sendMessage(ms_org, { text: "Erreur lors de la recherche d'images." }, { quoted: ms });
            }

            const images = results.slice(0, 5);
            if (images.length === 0) {
                return ovl.sendMessage(ms_org, { text: "Aucune image trouvée pour ce terme de recherche." }, { quoted: ms });
            }

            for (const image of images) {
                try {
                    await ovl.sendMessage(ms_org, {
                        image: { url: image.url },
                        caption: `\`\`\`Powered By OVL-MD\`\`\``
                    }, { quoted: ms });
                } catch (err) {
                    console.error("Erreur lors de l'envoi de l'image:", err);
                }
            }
        });
    }
);

ovlcmd(
    {
        nom_cmd: "lyrics",
        classe: "Search",
        react: "🎵",
        desc: "Cherche les paroles d'une chanson"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const songName = arg.join(" ");
        if (!songName) {
            return ovl.sendMessage(ms_org, { text: "Veuillez fournir un nom de chanson pour obtenir les paroles." }, { quoted: ms });
        }

        try {
            const lyrics = await LyricsFinder(songName);
            const mess = `🎸OVL-MD LYRICS FINDER🥁\n\n🎼PAROLES =>\n\n${lyrics}`;
            if (!lyrics) {
                return ovl.sendMessage(ms_org, { text: "Désolé, je n'ai pas trouvé les paroles pour cette chanson." }, { quoted: ms });
            }
            await ovl.sendMessage(ms_org, { text: mess }, {quoted: ms});
        } catch (error) {
            console.error("Erreur lors de la recherche des paroles :", error.message);
            ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la recherche des paroles." }, { quoted: ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "shazam",
    classe: "Search",
    react: "🎶",
    desc: "Identifie une chanson à partir d'un audio ou d'une vidéo."
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, repondre } = cmd_options;

    const mediaMessage = msg_Repondu?.audioMessage || msg_Repondu?.videoMessage;

    if (!mediaMessage) return repondre("Réponds à un message audio ou vidéo pour identifier la chanson.");

    try {
      const buffer = await ovl.dl_save_media_ms(mediaMessage);

      const form = new FormData();
      form.append("file", buffer, { filename: "audio.mp4" });
      form.append("return", "apple_music,spotify");
      form.append("api_token", "test");

      const response = await axios.post("https://api.audd.io/", form, {
        headers: form.getHeaders(),
      });

      const result = response.data.result;
console.log(result);
      if (!result || !result.title) return repondre("Aucune chanson reconnue.");

      const msg = `🎶 *Résultat :*\n\n` +
                  `🎧 *Titre* : ${result.title}\n` +
                  `🎤 *Artiste* : ${result.artist}\n` +
                  `💿 *Album* : ${result.album || "Inconnu"}\n` +
                  `📅 *Sortie* : ${result.release_date || "Inconnue"}\n` +
                  `⏱️ *Durée* : ${result.timecode || "N/A"}\n` +
                  `🔗 *Lien* : ${result.song_link || "Aucun"}`;

      repondre(msg);
    } catch (err) {
      console.error(err);
      repondre("Une erreur est survenue pendant l'identification.");
    }
  }
);

ovlcmd(
    {
        nom_cmd: "google",
        classe: "Search",
        desc: "Recherche sur Google.",
        alias: ["search"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        if (!arg[0]) {
            return await ovl.sendMessage(ms_org, { text: "❗ Entrez un terme à rechercher sur Google." }, { quoted: ms });
        }

        const searchTerm = arg.join(" ");
        try {
            const response = await axios.get(
                `https://www.googleapis.com/customsearch/v1`,
                {
                    params: {
                        q: searchTerm,
                        key: "AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI",
                        cx: "baf9bdb0c631236e5",
                    },
                }
            );

            if (!response.data.items || response.data.items.length === 0) {
                return await ovl.sendMessage(ms_org, {
                    text: "❗ Aucun résultat trouvé pour cette recherche.",
                }, { quoted: ms });
            }

            const results = response.data.items.slice(0, 3); // Limiter à 3 résultats

            let searchResultsMsg = `*🔍 Résultats de recherche pour : ${searchTerm}*\n\n`;
            results.forEach((result, index) => {
                searchResultsMsg += `${index + 1}.\n *📌Titre:* ${result.title}\n*📃Description:* ${result.snippet}\n*🌐Lien:* ${result.link}\n\n`;
            });

            await ovl.sendMessage(ms_org, { text: searchResultsMsg }, { quoted: ms });
        } catch (error) {
            console.error("Erreur dans la recherche Google :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Une erreur est survenue lors de la recherche sur Google. Veuillez réessayer.",
            }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "wiki",
        classe: "Search",
        react: "📖",
        desc: "Recherche sur Wikipédia.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        if (!arg[0]) {
            return await ovl.sendMessage(ms_org, { text: "❗ Entrez un terme à rechercher sur Wikipédia." }, { quoted: ms });
        }

        const searchTerm = arg.join(" ");
        try {
            const con = await wiki.summary(searchTerm);

            const mess = `*📖Wikipédia :*\n\n*📌Titre:* ${con.title}\n\n*📃Description:* ${con.description}\n\n*📄Résumé:* ${con.extract}\n\n*🌐Lien:* ${con.content_urls.mobile.page}`;

            await ovl.sendMessage(ms_org, { text: mess }, { quoted: ms });
        } catch (error) {
            console.error("Erreur dans la recherche Wikipédia :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Une erreur est survenue lors de la recherche sur Wikipédia. Veuillez réessayer.",
            }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "github",
        classe: "Search",
        react: "🔍",
        desc: "Récupère les informations d'un utilisateur GitHub"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const username = arg.join(" ");

        if (!username) {
            return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom d'utilisateur GitHub à rechercher." }, { quoted: ms });
        }

        try {
            const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`);
            const data = response.data;

            const message = `*👤 Nom d'utilisateur :* ${data.login}\n`
                + `*📛 Nom affiché :* ${data.name || "Non spécifié"}\n`
                + `*📝 Bio :* ${data.bio || "Aucune bio"}\n`
                + `*🏢 Entreprise :* ${data.company || "Non spécifiée"}\n`
                + `*📍 Localisation :* ${data.location || "Non spécifiée"}\n`
                + `*🔗 Lien :* ${data.html_url}\n`
                + `*👥 Followers :* ${data.followers}\n`
                + `*👤 Following :* ${data.following}\n`
                + `*📦 Repos publics :* ${data.public_repos}\n`
                + `*🕰️ Créé le :* ${data.created_at.split("T")[0]}`;

            if (data.avatar_url) {
                await ovl.sendMessage(ms_org, { image: { url: data.avatar_url }, caption: message }, { quoted: ms });
            } else {
                await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données GitHub :", error.message);
            ovl.sendMessage(ms_org, { text: "❗ Impossible de récupérer les données GitHub.\n" + error.message }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "imdb",
        classe: "Search",
        react: "🎬",
        desc: "Recherche des informations sur un film ou une série via IMDB"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const movieName = arg.join(" ");

        if (!movieName) {
            return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom de film ou de série à rechercher." },  { quoted: ms });
        }

        try {
            const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(movieName)}&plot=full&lang=fr`);
            const data = response.data;

            if (data.Response === "False") {
                return ovl.sendMessage(ms_org, { text: "❗ Impossible de trouver ce film ou cette série." },  { quoted: ms });
            }

            const trt_synopsis = await translate(data.Plot, { to: 'fr' }).then(res => res.text).catch(() => data.Plot);
            const trt_langue = await translate(data.Language, { to: 'fr' }).then(res => res.text).catch(() => data.Language);
            const trt_pays = await translate(data.Country, { to: 'fr' }).then(res => res.text).catch(() => data.Country);
            const trt_rec = await translate(data.Awards, { to: 'fr' }).then(res => res.text).catch(() => data.Awards);
            
            const imdbInfo = `⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n`
                + `🎬 *IMDB MOVIE SEARCH*\n`
                + `⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n`
                + `*🎞️ Titre :* ${data.Title}\n`
                + `*📅 Année :* ${data.Year}\n`
                + `*⭐ Classement :* ${data.Rated}\n`
                + `*📆 Sortie :* ${data.Released}\n`
                + `*⏳ Durée :* ${data.Runtime}\n`
                + `*🌀 Genre :* ${data.Genre}\n`
                + `*👨🏻‍💻 Réalisateur :* ${data.Director}\n`
                + `*✍ Scénariste :* ${data.Writer}\n`
                + `*👨 Acteurs :* ${data.Actors}\n`
                + `*📃 Synopsis :* ${trt_synopsis}\n`
                + `*🌐 Langue :* ${trt_langue}\n`
                + `*🌍 Pays :* ${trt_pays}\n`
                + `*🎖️ Récompenses :* ${trt_rec || "Aucune"}\n`
                + `*📦 Box-office :* ${data.BoxOffice || "Non disponible"}\n`
                + `*🏙️ Production :* ${data.Production || "Non spécifiée"}\n`
                + `*🌟 Note IMDb :* ${data.imdbRating} ⭐\n`
                + `*❎ Votes IMDb :* ${data.imdbVotes}`;

            if (data.Poster && data.Poster !== "N/A") {
                await ovl.sendMessage(ms_org, { image: { url: data.Poster }, caption: imdbInfo }, { quoted: ms });
            } else {
                await ovl.sendMessage(ms_org, { text: imdbInfo }, { quoted: ms });
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données IMDB :", error.message);
            ovl.sendMessage(ms_org, { text: "❗ Une erreur s'est produite lors de la recherche du film.\n" + error.message }, { quoted: ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "stickersearch",
    classe: "Search",
    react: "🖼️",
    desc: "Recherche et envoie des stickers animés basés sur un mot-clé.",
    alias: ["sstick"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, auteur_Message, ms} = cmd_options;
    
    if (!arg.length) {
      return ovl.sendMessage(ms_org, { text: "Veuillez fournir un terme de recherche pour le sticker !" }, { quoted: ms });
    }

    if (cmd_options.verif_Groupe) {
      ovl.sendMessage(ms_org, { text: "Pour éviter le spam, les stickers seront envoyés en privé. 📥" }, { quoted: ms });
    }

    const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
    const searchTerm = encodeURIComponent(arg.join(" "));

    try {
      const response = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
      );
      
      const stickers = response.data.results;
      if (!stickers.length) {
        return ovl.sendMessage(ms_org, { text: "Aucun sticker trouvé pour cette recherche." }, { quoted: ms });
      }

      for (let i = 0; i < Math.min(8, stickers.length); i++) {
        const gifUrl = stickers[i].media_formats.gif.url;
        const sticker = new Sticker(gifUrl, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 60,
          background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();
        await ovl.sendMessage(auteur_Message, { sticker: stickerBuffer },  { quoted: ms });
      }
    } catch (error) {
      console.error(error);
      ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération des stickers." },  { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "meteo",
    classe: "Search",
    react: "🌦️",
    desc: "Affiche la météo d'une ville.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
    const cityName = arg.join(" ");

    if (!cityName) {
      return ovl.sendMessage(ms_org, { text: "❗ Veuillez fournir un nom de ville." }, { quoted: ms });
    }

    try {
      const apiKey = "1ad47ec6172f19dfaf89eb3307f74785";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      const city = data.name;
      const country = data.sys.country;
      const temperature = data.main.temp;
      const feelsLike = data.main.feels_like;
      const minTemperature = data.main.temp_min;
      const maxTemperature = data.main.temp_max;
      const description = data.weather[0].description;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const rainVolume = data.rain ? data.rain["1h"] || 0 : 0;
      const cloudiness = data.clouds.all;
      const sunrise = new Date(data.sys.sunrise * 1000);
      const sunset = new Date(data.sys.sunset * 1000);

      // Formatage des heures de lever et coucher du soleil (juste h:min:s)
      const formatTime = (date) => {
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      const formattedSunrise = formatTime(sunrise);
      const formattedSunset = formatTime(sunset);

      const weatherMessage = `🌍 *Météo à ${city}, ${country}*  

🌡️ *Température :* ${temperature}°C  
🌡️ *Ressenti :* ${feelsLike}°C  
📉 *Température min :* ${minTemperature}°C  
📈 *Température max :* ${maxTemperature}°C  
📝 *Description :* ${description.charAt(0).toUpperCase() + description.slice(1)}  
💧 *Humidité :* ${humidity}%  
💨 *Vent :* ${windSpeed} m/s  
🌧️ *Précipitations (1h) :* ${rainVolume} mm  
☁️ *Nébulosité :* ${cloudiness}%  
🌄 *Lever du soleil (GMT) :* ${formattedSunrise}  
🌅 *Coucher du soleil (GMT) :* ${formattedSunset}`;

      await ovl.sendMessage(ms_org, { text: weatherMessage },  { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de la récupération des données météo :", error.message);
      await ovl.sendMessage(ms_org, { text: "❗ Impossible de trouver cette ville. Vérifiez l'orthographe et réessayez !" }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "anime",
    classe: "Search",
    react: "📺",
    desc: "Recherche un anime aléatoire avec un résumé et un lien vers MyAnimeList."
  },
  async (ms_org, ovl, cmd_options) => {
   
    const link = "https://api.jikan.moe/v4/random/anime";

    try {
      const response = await axios.get(link);
      const data = response.data.data;

      const title = data.title;
      let synopsis = data.synopsis;
      const imageUrl = data.images.jpg.image_url;
      const episodes = data.episodes;
      const status = data.status;

      const trts = await translate(synopsis, { to: 'fr' }).then(res => res.text).catch(() => synopsis);
      const trt_status = await translate(status, { to: 'fr' }).then(res => res.text).catch(() => status);
    
        const message = `✨ *ANIME ALÉATOIRE* ✨\n\n` +
          `📺 *Titre* : ${title}\n` +
          `🎬 *Épisodes* : ${episodes}\n` +
          `📡 *Statut* : ${trt_status}\n` +
          `🔗 *URL* : ${data.url}\n` +
          `📝 *Synopsis* : ${trts}\n`

      await ovl.sendMessage(ms_org, {
        image: { url: imageUrl },
        caption: message
      }, { quoted: cmd_options.ms });

    } catch (error) {
        console.error(error);
      ovl.sendMessage(ms_org, { text: 'Une erreur est survenue lors de la récupération des informations de l\'anime.' }, { quoted: cmd_options.ms });
    }
  }
);

ovlcmd(
    {
        nom_cmd: "ytsearch",
        classe: "Search",
        react: "🎵",
        desc: "Recherche une chanson depuis YouTube avec un terme de recherche",
        alias: ['yts']
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        if (!arg.length) {
            return await ovl.sendMessage(ms_org, {
                text: "Veuillez spécifier un terme de recherche.",
            }, { quoted: ms });
        }

        const query = arg.join(" ");
        try {
            const searchResults = await ytsr(query, { limit: 5 });
            if (searchResults.items.length === 0) {
                return await ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé." }, { quoted: ms });
            }

            const results = searchResults.items.map((item, index) => {
                return `${index + 1}. \n*⬡Titre:* ${item.name}\n*⬡URL*: ${item.url}\n*⬡Vues:* ${item.views}\n*⬡Durée:* ${item.duration}\n\n`;
            }).join("\n");

            await ovl.sendMessage(ms_org, {
                text: `╭─── 〔 OVL-MD YTS 〕 ──⬣\n${results}\n╰──────────────────⬣`,
            }, { quoted: ms });
        } catch (error) {
            console.error("Erreur YTSearch:", error.message);
            await ovl.sendMessage(ms_org, { text: "Erreur lors de la recherche." }, { quoted: ms });
        }
    }
);


ovlcmd(
  {
    nom_cmd: "apk_search",
    classe: "Search",
    react: "🔍",
    desc: "Rechercher des applications sur Aptoide",
    alias: ["apks"],
  },  
  async (ms_org, ovl, cmd_options) => {
    const { repondre, arg, ms } = cmd_options;

    try {
      const appName = arg.join(' ');
      if (!appName) {
        return repondre("*Veuillez entrer le nom de l'application à rechercher* 🧐");
      }

      const searchResults = await search(appName);

      if (searchResults.length === 0) {
        return repondre("*Aucune application trouvée, essayez un autre nom* 😕");
      }

      const limitedResults = searchResults.slice(0, 10);

      const appDetails = await Promise.all(
        limitedResults.map(async (app) => {
          const appData = await download(app.id);
          return {
            name: app.name,
            id: app.id,
            lastup: appData.lastup,
            size: appData.size || "Inconnue",
          };
        })
      );

      let messageText = "*🔍OVL-MD APK-SEARCH:*\n\n";
      appDetails.forEach((app, index) => {
        messageText += `📱 *${index + 1}. Nom:* ${app.name}\n🆔 *ID:* ${app.id}\n📅 *Dernière mise à jour:* ${app.lastup}\n📦 *Taille:* ${app.size}\n\n`;
      });

      repondre(messageText);
    } catch (error) {
      console.error('Erreur lors de la recherche des applications :', error);
      repondre("*Erreur lors du traitement de la commande apk_search* ⚠️");
    }
  }
);
