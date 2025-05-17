const { ovlcmd } = require("../lib/ovlcmd");
const { WA_CONF } = require('../DataBase/wa_conf');

ovlcmd(
    {
        nom_cmd: "save",
        classe: "Status",
        react: "💾",
        desc: "Télécharge un statut WhatsApp",
    },
    async (ms_org, ovl, _cmd_options) => {
        const { ms, msg_Repondu, repondre } = _cmd_options;
         
        try {
            let media, options = { quoted: ms };
            
            if (msg_Repondu.extendedTextMessage) {
                await ovl.sendMessage(ovl.user.id, { text: msg_Repondu.extendedTextMessage.text }, options);
            } else if (msg_Repondu.imageMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
                await ovl.sendMessage(ovl.user.id, { image: { url: media }, caption: msg_Repondu.imageMessage.caption }, options);
            } else if (msg_Repondu.videoMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
                await ovl.sendMessage(ovl.user.id, { video: { url: media }, caption: msg_Repondu.videoMessage.caption }, options);
            } else if (msg_Repondu.audioMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
                await ovl.sendMessage(id_Bot, { audio: { url: media }, mimetype: "audio/mp4", ptt: false }, options);
            } else {
                return repondre("Ce type de statut n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("Erreur lors du téléchargement du statut :", _error.message || _error);
        }
    }
);

ovlcmd(
  {
    nom_cmd: "presence",
    classe: "Private",
    react: "👤",
    desc: "Active ou configure la présence sur WhatsApp",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const validtypes = ['off', 'enligne', 'enregistre', 'ecrit'];
      const types = {
        '1': 'enligne',
        '2': 'enregistre',
        '3': 'ecrit'
      };

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', presence: 'non' },
      });

      if (sousCommande === 'off') {
        settings.presence = 'non';
        await settings.save();
        return repondre("La présence est maintenant désactivée.");
      }

      if (types[sousCommande]) {
        if (settings.presence === types[sousCommande]) {
          return repondre(`La présence est déjà configurée sur ${types[sousCommande]}`);
        }

        settings.presence = types[sousCommande];
        await settings.save();
        return repondre(`La présence est maintenant définie sur ${types[sousCommande]}`);
      }

      return repondre("Utilisation :\n" +
        "presence 1: Configurer la présence sur 'enligne'\n" +
        "presence 2: Configurer la présence sur 'enregistre'\n" +
        "presence 3: Configurer la présence sur 'ecrit'\n" +
        "presence off: Désactiver la présence");
    } catch (error) {
      console.error("Erreur lors de la configuration de presence :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "lecture_status",
    classe: "Status",
    react: "📖",
    desc: "Active ou désactive la lecture auto des status",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', lecture_status: 'non' },
      });

      if (sousCommande === 'off') {
        settings.lecture_status = 'non';
        await settings.save();
        return repondre("La lecture du statut est maintenant désactivée.");
      }

      if (sousCommande === 'on') {
        settings.lecture_status = 'oui';
        await settings.save();
        return repondre("La lecture du statut est maintenant activée.");
      }

      return repondre("Utilisation :\n" +
        "lecture_status on: Activer la lecture du statut\n" +
        "lecture_status off: Désactiver la lecture du statut");
    } catch (error) {
      console.error("Erreur lors de la configuration de lecture_status :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "dl_status",
    classe: "Status",
    react: "📥",
    desc: "Active ou désactive le téléchargement auto des status",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', dl_status: 'non' },
      });

      if (sousCommande === 'off') {
        settings.dl_status = 'non';
        await settings.save();
        return repondre("Le téléchargement du statut est maintenant désactivé.");
      }

      if (sousCommande === 'on') {
        settings.dl_status = 'oui';
        await settings.save();
        return repondre("Le téléchargement du statut est maintenant activé.");
      }

      return repondre("Utilisation :\n" +
        "dl_status on: Activer le téléchargement du statut\n" +
        "dl_status off: Désactiver le téléchargement du statut");
    } catch (error) {
      console.error("Erreur lors de la configuration de dl_status :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "likestatus",
    classe: "Status",
    react: "👍",
    desc: "Active ou désactive les likes auto sur les statuts",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', like_status: 'non' },
      });

      if (sousCommande === 'off') {
        settings.like_status = 'non';
        await settings.save();
        return repondre("Les likes sur les statuts sont maintenant désactivés.");
      } else if (sousCommande !== 'off'){
        settings.like_status = sousCommande;
        await settings.save();
        return repondre("Les likes sur les statuts sont maintenant activés.");
      }

      return repondre("Utilisation :\n" +
        "like_status <emoji>: Activer les likes sur les statuts\n" +
        "like_status off: Désactiver les likes sur les statuts");
    } catch (error) {
      console.error("Erreur lors de la configuration de like_status :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);
