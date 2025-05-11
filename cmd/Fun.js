const { ovlcmd } = require("../lib/ovlcmd");
const fancy = require("../lib/style");
const config = require("../set");
const fs = require('fs');
const axios = require('axios');
const { levels } = require('../DataBase/levels');
const { Ranks } = require('../DataBase/rank')
                      
ovlcmd(
    {
        nom_cmd: "fliptext",
        classe: "Fun",
        desc: "Inverse le texte fourni.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const text = arg.join(" ");
        if (!text) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez fournir un texte à inverser !" }, { quoted: ms });
        }
        const flipped = text.split("").reverse().join("");
        await ovl.sendMessage(ms_org, { text: flipped }, { quoted: ms });
    }
);

ovlcmd(
    {
        nom_cmd: "readmore",
        classe: "Fun",
        desc: "Ajoute un effet 'voir plus' au texte.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const text = arg.join(" ");
        if (!text) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez fournir un texte" }, { quoted: ms });
        }
        const hiddenText = `${text.split(" ").join(" ")}${String.fromCharCode(8206).repeat(4001)}`;
        await ovl.sendMessage(ms_org, { text: hiddenText }, { quoted: ms });
    }
);

ovlcmd(
    {
        nom_cmd: "ship",
        classe: "Fun",
        desc: "Test de compatibilité entre deux personnes",
        alias: ["match"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { auteur_Msg_Repondu, auteur_Message, arg, ms } = cmd_options;
        const tags = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
         if (tags.length === 0) {
            return await ovl.sendMessage(ms_org, { text: "Mentionne une personne" }, { quoted: ms });
         }
        const randomPercentage = Math.floor(Math.random() * 101);
        let comment;
        if (randomPercentage <= 30) {
            comment = "💔 Pas vraiment compatibles... 😢";
        } else if (randomPercentage <= 70) {
            comment = "🤔 Il y a du potentiel, mais cela demande du travail !";
        } else {
            comment = "💖 Vous êtes faits l'un pour l'autre ! 🌹";

        }

        await ovl.sendMessage(ms_org, {
            text: `💘 *Ship*\n\n @${tags.split("@")[0]} & @${auteur_Message.split("@")[0]}, ${comment}.\n💖Compatibilité :*${randomPercentage}%*`,
            mentions: [tags, auteur_Message],
        }, { quoted: ms });
    }
);
 
ovlcmd(
    {
        nom_cmd: "couplepp",
        classe: "Fun",
        desc: "Envoie des photos de couple animées.",
        alias: ["cpp"],
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const { data } = await axios.get("https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json");
            const randomPicture = data[Math.floor(Math.random() * data.length)];
            await ovl.sendMessage(ms_org, {
                image: { url: randomPicture.female },
                caption: "❤️ *Pour Madame 💁🏻‍♀️*",
            }, { quoted: cmd_options.ms });
            await ovl.sendMessage(ms_org, {
                image: { url: randomPicture.male },
                caption: "❤️ *Pour Monsieur 💁🏻‍♂️*",
            }, { quoted: cmd_options.ms });
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Impossible de récupérer les images. Réessaie plus tard.",
            }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "fancy",
    classe: "Fun",
    react: "✍️",
    desc: "Applique un style fancy au texte",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre } = cmd_options;
    const id = parseInt(arg[0], 10);
    const text = arg.slice(1).join(" ");
    const prefixe = config.PREFIXE;

    if (isNaN(id) || !text) {
      return await repondre(
        `\nExemple : ${prefixe}fancy 10 OVL-MD\n` +
          String.fromCharCode(8206).repeat(4001) +
          fancy.list("ovl-md", fancy)
      );
    }

    try {
      const selectedStyle = fancy[id - 1];
      if (selectedStyle) {
        return await repondre(fancy.apply(selectedStyle, text));
      } else {
        return await repondre(`_Style introuvable pour l'ID : ${id}_`);
      }
    } catch (error) {
      console.error("Erreur lors de l'application du style :", error);
      return await repondre("_Une erreur s'est produite :(_");
    }
  }
);

ovlcmd(
    {
        nom_cmd: "blague",
        classe: "Fun",
        react: "😂",
        desc: "Renvoie une blague"
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            let apiUrl = `https://v2.jokeapi.dev/joke/Any?lang=fr`;
            let response = await axios.get(apiUrl);
            let data = response.data;

            if (data.type === 'single') {
                ovl.sendMessage(ms_org, { text: `*Blague du jour :* ${data.joke}` }, { quoted: cmd_options.ms });
            } else if (data.type === 'twopart') {
                ovl.sendMessage(ms_org, { text: `*Blague du jour :* ${data.setup}\n\n*Réponse :* ${data.delivery}` }, { quoted: cmd_options.ms });
            } else {
                ovl.sendMessage(ms_org, { text: "Désolé, je n'ai pas trouvé de blague à vous raconter." }, { quoted: cmd_options.ms });
            }
        } catch (error) {
            ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération de la blague." }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "citation",
    classe: "Fun",
    react: "💬",
    desc: "Renvoie une citation",
  },
  async (ms_org, ovl) => {
    try {
      const apiUrl = "https://kaamelott.chaudie.re/api/random";
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === 1 && data.citation) {
        const citation = data.citation.citation;
        const auteur = data.citation.infos.auteur || "Inconnu";
        const personnage = data.citation.infos.personnage || "Personnage inconnu";
        const saison = data.citation.infos.saison || "Saison inconnue";
        const episode = data.citation.infos.episode || "Épisode inconnu";

        const message = `*Citation du jour :*\n"${citation}"\n\n*Auteur :* ${auteur}\n*Personnage :* ${personnage}\n*Saison :* ${saison}\n*Épisode :* ${episode}`;
        ovl.sendMessage(ms_org, { text: message });
      } else {
        ovl.sendMessage(ms_org, { text: "Désolé, je n'ai pas trouvé de citation à vous donner." });
      }
    } catch (error) {
      ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération de la citation." });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "meme",
    classe: "Fun",
    react: "🤣",
    desc: "Renvoie un mème aléatoire",
  },
  async (ms_org, ovl, { repondre, ms }) => {
    try {
      const response = await axios.get('https://meme-api.com/gimme');
      const meme = response.data;

      if (!meme || !meme.url) {
        return repondre("Aucun mème trouvé pour le moment.");
      }

      await ovl.sendMessage(ms_org, {
        image: { url: meme.url },
        caption: ''
      }, { quoted: ms });

    } catch (err) {
      console.error(err);
      repondre("Une erreur s'est produite lors de la récupération du mème.");
    }
  }
);

ovlcmd(
    {
        nom_cmd: "rank",
        classe: "Fun",
        react: "🏆",
        desc: "Affiche le rang d'un utilisateur selon ses messages envoyés et gère l'activation/désactivation globale du level up."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, auteur_Message, auteur_Msg_Repondu, ms } = cmd_options;
         
        const userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteur_Msg_Repondu || auteur_Message;

        let pp;
        try {
            pp = await ovl.profilePictureUrl(userId, 'image');
        } catch {
            pp = 'https://files.catbox.moe/ulwqtr.jpg';
        }
    
        const allUsers = await Ranks.findAll({
            order: [['messages', 'DESC']]
        });

        const user = await Ranks.findOne({ where: { id: userId } });
        if (!user) {
            return ovl.sendMessage(ms_org, { text: "Vous n'avez pas encore de rang. Commencez à interagir pour en obtenir un !" }, { quoted: ms });
        }

        const { name, level, exp, messages } = user;
        const nextLevelExp = levels[level] ? levels[level + 1].expRequired : "Max";
        const rankPosition = allUsers.findIndex(u => u.id === userId) + 1;
        const totalUsers = allUsers.length;
        const message = `╭───🏆 *OVL-RANK* 🏆───╮
┃ 🏷️ *Nom :* ${name || "Inconnu"}
┃ 🥇 *Classement :* ${rankPosition}/${totalUsers}
┃ 🔰 *Niveau :* ${level}
┃ 🏅 *Titre :* ${levels[level - 1]?.name || "OVL-GOD-LEVEL"} 
┃ 📊 *EXP :* ${exp}/${nextLevelExp || "Max"}
┃ ✉️ *Messages :* ${messages}
╰──────────────────╯`;

        await ovl.sendMessage(ms_org, {
            image: { url: pp },
            caption: message,
        }, { quoted: ms });
    }
);


ovlcmd(
    {
        nom_cmd: "toprank",
        classe: "Fun",
        react: "🥇",
        desc: "Voir les meilleurs utilisateurs"
    },
    async (ms_org, ovl, cmd_options) => {
        const topUsers = await Ranks.findAll({
            order: [['messages', 'DESC']],
            limit: 10
        });

        if (topUsers.length === 0) {
            return ovl.sendMessage(ms_org, { text: "Aucune donnée disponible pour le moment." }, { quoted: cmd_options.ms });
        }

        let rankMessage = `
╭───🏆 *OVL-TOP-RANK* 🏆───╮`;

        topUsers.forEach((user, index) => {
            const position = `${index + 1}`.padStart(2, " ");
            rankMessage += `┃ ${position}. 🏷️ *Nom :* ${user.name || "Inconnu"}
┃    ✉️ *Messages :* ${user.messages}
┃    🔰 *Niveau :* ${user.level} (${levels[user.level - 1]?.name || "OVL-GOD-LEVEL"})\n┃\n`;
        });
rankMessage += `╰─────────────────────╯`;
        await ovl.sendMessage(ms_org, { text: rankMessage }, { quoted: cmd_options.ms });
    }
);
