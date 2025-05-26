const { ovlcmd } = require("../lib/ovlcmd");
const { getInfosEconomie } = require("../../DataBase/economie");
const crypto = require("crypto");

function generateUserId(jid) {
    const hash = crypto.createHash('md5').update(jid).digest("hex");
    return `User-${hash.slice(0, 6)}`;
}

ovlcmd(
    {
        nom_cmd: "myovl_econ",
        desc: "Afficher votre portefeuille et banque",
        react: "💰",
        classe: "Économie"
    },
    async (ms_org, ovl, cmd) => {
        const { ms, arg, auteur_Message, auteur_Msg_Repondu } = cmd;


        const userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteur_Msg_Repondu || auteur_Message;

        let pp;
        try {
            pp = await ovl.profilePictureUrl(userId, 'image');
        } catch {
            pp = 'https://files.catbox.moe/ulwqtr.jpg';
        }


        const data = await getInfosEconomie(userId);
        const pseudo = data.pseudo || "Inconnu";
        const wallet = data.portefeuille || 0;
        const banque = data.banque || 0;
        const capacite = data.capacite_banque || 1;
 
        const identifiantStable = generateUserId(userId);
 
        const message = `╭───────🎒 *OVL-ECON--Y* 🎒───────╮
┃ 👤 *Pseudo :* ${pseudo}
┃ 🆔 *Identifiant :* ${identifiantStable}
┃ 💼 *Portefeuille :* ${wallet} 💸
┃ 🏦 *Banque :* ${banque} 🪙
┃ 📈 *Capacité Banque :* ${capacite} 🧱
╰───────────────────────────╯`;
await ovl.sendMessage(ms_org, {
      image: { url: pp },
      caption: message
    }, { quoted: ms });
  }
);

