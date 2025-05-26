const { ovlcmd } = require("../lib/ovlcmd");
const { modifierSolde, getInfosUtilisateur, resetEconomie } = require("../../DataBase/economie");
const crypto = require("crypto");

function generateUserId(jid) {
    const hash = crypto.createHash('md5').update(jid).digest("hex");
    return `User-${hash.slice(0, 6)}`;
}

function generateTransactionId() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
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


        const data = await getInfosUtilisateur(userId);
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

ovlcmd(
    {
        nom_cmd: "transfer",
        desc: "Transferer de l'argent de votre banque vers la banque d'un autre utilisateur",
        react: "💸",
        classe: "Economie"
    },
    async (ms_org, ovl, cmd) => {
        const { ms, arg, auteur_Message, repondre } = cmd;

        if (arg.length < 2) {
            return repondre("Usage: transfer @utilisateur montant");
        }

        const destinataireId = arg[0].includes("@") ? `${arg[0].replace("@", "")}@s.whatsapp.net` : null;
        if (!destinataireId) {
            return repondre("Merci de mentionner un utilisateur valide (@numero).");
        }

        if (destinataireId === auteur_Message) {
            return repondre("Vous ne pouvez pas vous transferer de l'argent a vous-meme.");
        }

        const montant = parseInt(arg[1]);
        if (isNaN(montant) || montant <= 0) {
            return repondre("Le montant doit etre un nombre entier positif.");
        }

        try {
            const expediteur = await getInfosUtilisateur(auteur_Message);
            const destinataire = await getInfosUtilisateur(destinataireId);

            if (!expediteur) {
                return repondre("Profil de l'expediteur introuvable.");
            }
            if (!destinataire) {
                return repondre("Profil du destinataire introuvable.");
            }

            if (expediteur.banque < montant) {
                return repondre("Fonds insuffisants dans votre banque pour ce transfert.");
            }

            if ((destinataire.banque + montant) > destinataire.capacite_banque) {
                return repondre(
                    `Le destinataire ne peut pas recevoir ce montant car cela depasserait sa capacite bancaire (${destinataire.capacite_banque}).`
                );
            }

            await modifierSolde(auteur_Message, "banque", -montant);
            await modifierSolde(destinataireId, "banque", montant);

            const transactionId = generateTransactionId();

            const recu = `╭── 💸 *RECU DE TRANSFERT* 💸 ──╮
┃ 🔀 *Transfert de banque a banque*
┃ 🆔 *ID de transaction :* ${transactionId}
┃ 👤 *Expediteur :* ${expediteur.pseudo || "Inconnu"}
┃ 👥 *Destinataire :* ${destinataire.pseudo || "Inconnu"}
┃ 💰 *Montant transfere :* ${montant} 🪙
┃ 📅 *Date :* ${new Date().toLocaleString()}
╰───────────────────────────╯`;

            return repondre(recu);
        } catch (error) {
            console.error("Erreur lors du transfert :", error);
            return repondre("Une erreur est survenue lors du transfert. Veuillez reessayer plus tard.");
        }
    }
);

ovlcmd(
  {
    nom_cmd: "resetaccount",
    react: "♻️",
    desc: "Réinitialise le compte économie d'un utilisateur"
  },
  async (ms_org, ovl, { arg, auteur_Msg_Repondu }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas l'autorisation d'exécuter cette commande.");
    }

    const cible = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteur_Msg_Repondu;

    if (!cible) {
      repondre("Veuillez mentionner un utilisateur ou répondre à son message.");

    const utilisateur = await resetEconomie(cible, {
      wallet: true,
      banque: true,
      capacite: true
    });

    if (!utilisateur) {
      return repondre("Utilisateur introuvable dans la base de données.");
    }
    const identifiantStable = generateUserId(cible);
    const message = `✅ Le compte économie de l'utilisateur a bien été réinitialisé :
╭── 💼 *RESET ECONOMIE* ──╮
┃ 👤 Utilisateur : ${utilisateur.pseudo || "Inconnu"}
┃ 🆔 ID : ${identifiantStable}
┃ 💰 Portefeuille : ${utilisateur.portefeuille} 🪙
┃ 🏦 Banque : ${utilisateur.banque} 🪙
┃ 📦 Capacité : ${utilisateur.capacite_banque}
╰──────────────────────╯`;

    await repondre(message);
  }
);
