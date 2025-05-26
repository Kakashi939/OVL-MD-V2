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
        const capacite = data.capacite_banque || 10000;
 
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
    desc: "Transférer de l'argent de votre banque vers la banque d'un autre utilisateur",
    react: "💸",
    classe: "Economie"
  },
  async (ms_org, ovl, cmd) => {
    const { ms, arg, auteur_Message, repondre } = cmd;

    if (arg.length < 2) {
      return repondre("Usage : transfer @utilisateur montant");
    }

    const destinataireId = arg[0].includes("@") ? `${arg[0].replace("@", "")}@s.whatsapp.net` : null;
    if (!destinataireId) {
      return repondre("Merci de mentionner un utilisateur valide (@numéro).");
    }

    if (destinataireId === auteur_Message) {
      return repondre("Vous ne pouvez pas vous transférer de l'argent à vous-même.");
    }

    const montant = parseInt(arg[1]);
    if (isNaN(montant) || montant <= 0) {
      return repondre("Le montant doit être un nombre entier positif.");
    }

    try {
      const expediteur = await getInfosUtilisateur(auteur_Message);
      const destinataire = await getInfosUtilisateur(destinataireId);

      if (!expediteur) return repondre("Profil de l'expéditeur introuvable.");
      if (!destinataire) return repondre("Profil du destinataire introuvable.");

      if (expediteur.banque < montant) {
        return repondre("Fonds insuffisants dans votre banque.");
      }

      const montantRecu = Math.floor(montant * 0.99); // 1% de frais
      if ((destinataire.banque + montantRecu) > destinataire.capacite_banque) {
        return repondre(`Ce transfert dépasserait la capacité du destinataire (${destinataire.capacite_banque} 🪙).`);
      }

      await modifierSolde(auteur_Message, "banque", -montant);
      await modifierSolde(destinataireId, "banque", montantRecu);

      const transactionId = generateTransactionId();

      const recu = `╭── 💸 *REÇU DE TRANSFERT* 💸 ──╮
┃ 🔁 *Transfert de banque à banque*
┃ 🆔 *Transaction ID :* ${transactionId}
┃ 👤 *Expéditeur :* ${expediteur.pseudo || "Inconnu"}
┃ 👥 *Destinataire :* ${destinataire.pseudo || "Inconnu"}
┃ 💰 *Montant envoyé :* ${montant} 🪙
┃ 📉 *Frais (1%) :* ${montant - montantRecu} 🪙
┃ 📥 *Montant reçu :* ${montantRecu} 🪙
┃ 📅 *Date :* ${new Date().toLocaleString()}
╰──────────────────────────────╯`;

      return repondre(recu);
    } catch (error) {
      console.error("Erreur lors du transfert :", error);
      return repondre("Une erreur est survenue. Réessayez plus tard.");
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

const prixCapacite = {
  1: { montant: 10000, capacite: 100000 },
  2: { montant: 100000, capacite: 1000000 },
  3: { montant: 1000000, capacite: 10000000 },
  4: { montant: 10000000, capacite: 100000000 },
  5: { montant: 100000000, capacite: 1000000000 },
};

ovlcmd(
  {
    nom_cmd: "capacite",
    react: "📦",
    desc: "Augmenter la capacite de la banque"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const niveau = parseInt(arg[0]);

    if (!niveau || !prixCapacite[niveau]) {
      return repondre("Veuillez choisir un niveau entre 1 et 5.");
    }

    const utilisateur = await getInfosUtilisateur(auteur);
    const { portefeuille } = utilisateur;

    const { montant, capacite } = prixCapacite[niveau];

    if (portefeuille < montant) {
      return repondre(`💸 Fonds insuffisants. Il faut ${montant} 🪙 dans le portefeuille.`);
    }

    await modifierSolde(auteur_Message, { portefeuille: -montant, capacite_banque: capacite }, true);

    repondre(
      `✅ *Capacité améliorée au niveau ${niveau}*
📦 *Nouvelle capacité :* ${capacite} 🪙
💰 *Coût :* ${montant} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "depot",
    react: "🏦",
    desc: "Transférer des fonds du portefeuille vers la banque"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const montant = parseInt(arg[0]);
    if (!montant || montant <= 0) {
      return repondre("Veuillez entrer un montant valide à déposer.");
    }

    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque, capacite_banque } = utilisateur;

    if (portefeuille < montant) {
      return repondre("Fonds insuffisants dans le portefeuille.");
    }

    if (banque + montant > capacite_banque) {
      return repondre(`Ce dépôt dépasserait la capacité de votre banque (${capacite_banque} 🪙).`);
    }

    await modifierSolde(auteur_Message, { portefeuille: -montant, banque: montant }, true);

    repondre(
      `🏦 *Dépôt effectué avec succès !*
💰 *Montant déposé :* ${montant} 🪙
📦 *Banque actuelle :* ${banque + montant} / ${capacite_banque} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "retrait",
    react: "💼",
    desc: "Transférer des fonds de la banque vers le portefeuille"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const montant = parseInt(arg[0]);
    if (!montant || montant <= 0) {
      return repondre("Veuillez entrer un montant valide à retirer.");
    }

    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque } = utilisateur;

    if (banque < montant) {
      return repondre("Fonds insuffisants dans la banque.");
    }

    const montantFinal = Math.floor(montant * 0.99);
    const frais = montant - montantFinal;

    await modifierSolde(auteur_Message, {
      banque: -montant,
      portefeuille: montantFinal
    }, true);

    repondre(
      `💼 *Retrait effectué avec succès !*
💰 *Montant demandé :* ${montant} 🪙
📉 *Frais (1%) :* ${frais} 🪙
💵 *Montant reçu :* ${montantFinal} 🪙
👛 *Portefeuille actuel :* ${portefeuille + montantFinal} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "vol",
    desc: "Tenter de voler un autre utilisateur",
    react: "🕶️",
    classe: "Economie"
  },
  async (ms_org, ovl, { repondre, auteur_Message, arg }) => {
    const victimeId = arg[0]?.includes("@") ? `${arg[0].replace("@", "")}@s.whatsapp.net` : null;

    if (!victimeId) return repondre("Mentionne un utilisateur valide à voler.");

    if (victimeId === auteur_Message) return repondre("Tu ne peux pas te voler toi-même, voleur paresseux 😒.");

    const voleur = await getInfosUtilisateur(auteur_Message);
    const victime = await getInfosUtilisateur(victimeId);

    if (!voleur || !victime) return repondre("Impossible de trouver les profils des utilisateurs.");

    if (voleur.portefeuille < 1000)
      return repondre("💸 Tu dois avoir au moins 1000 🪙 pour tenter un vol (au cas où tu te fais attraper).");

    if (victime.portefeuille < 1000)
      return repondre("🤷🏽‍♂️ Ta victime est trop pauvre... Trouve-toi une meilleure cible.");

    const scenarios = ["echoue", "reussi", "attrape"];
    const resultat = scenarios[Math.floor(Math.random() * scenarios.length)];

    switch (resultat) {
      case "echoue":
        return repondre("😬 Ta victime s'est échappée ! Sois plus intimidant la prochaine fois.");

      case "reussi": {
        const montantVole = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(victimeId, "portefeuille", -montantVole);
        await modifierSolde(auteur_Message, "portefeuille", montantVole);
        return repondre(`🤑 Vol réussi ! Tu as volé *${montantVole} 🪙* à ta victime.`);
      }

      case "attrape": {
        const amende = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(auteur_Message, "portefeuille", -amende);
        return repondre(`🚓 Oups ! Tu t'es fait attraper par la police. Amende : *${amende} 🪙*.`);
      }

      default:
        return repondre("Une erreur est survenue. Essaie encore.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "pari",
    desc: "Parier de l'argent en devinant une direction",
    react: "🎲",
    classe: "Economie"
  },
  async (ms_org, ovl, { repondre, auteur_Message, arg }) => {
    const montant = parseInt(arg[0]);
    const direction = arg[1]?.toLowerCase();

    const directionsFr = ["haut", "bas", "gauche", "droite"];

    if (!montant || montant < 50) {
      return repondre("Tu dois miser au moins 50 🪙.");
    }

    if (!direction || !directionsFr.includes(direction)) {
      return repondre("🧭 Choisis une direction valide : *haut, bas, gauche ou droite*.\nExemple : `pari 200 gauche`");
    }

    const joueur = await getInfosUtilisateur(auteur_Message);
    if (joueur.portefeuille < montant) {
      return repondre("💸 Fonds insuffisants dans ton portefeuille.");
    }
      
    const directionAleatoireFr = directionsFr[Math.floor(Math.random() * directionsFr.length)];
    const directionAleatoire = mapDirections[directionAleatoireFr];

    const imagesDirection = {
      haut: "https://files.catbox.moe/j0wmsd.jpg",
      bas: "https://files.catbox.moe/qizuxk.jpg",
      gauche: "https://files.catbox.moe/lj7xmc.jpg",
      droite: "https://files.catbox.moe/dsfbhl.jpg"
    };

    await ovl.sendMessage(ms_org, {
      image: { url: imagesDirection[direction] },
      caption: '',
    }, { quoted: ms });

    if (direction === directionAleatoireFr) {
      const gain = montant * 2;
      await modifierSolde(auteur_Message, "portefeuille", gain);
      return repondre(`🎉 *Bravo !* La direction était *${directionAleatoireFr}*.\n✅ Tu gagnes *${gain} 🪙* !`);
    } else {
      await modifierSolde(auteur_Message, "portefeuille", -montant);
      return repondre(`😓 *Raté !* La direction correcte était *${directionAleatoireFr}*.\n❌ Tu perds *${montant} 🪙*.`);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "slot",
    desc: "Jouer à la machine à sous",
    react: "🎰",
    classe: "Economie"
  },
  async (ms_org, ovl, { auteur_Message, repondre }) => {
    const { portefeuille } = await getInfosUtilisateur(auteur_Message);
    if (portefeuille < 100) return repondre("💰 Tu as besoin d'au moins 100 🪙 pour jouer.");

    const emojis = ["🔴", "🔵", "🟣", "🟢", "🟡", "⚪️", "⚫️"];
    const lignes = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Math.floor(Math.random() * emojis.length))
    );

    const grille = lignes.map(l => l.map(i => emojis[i]));
    const afficher = grille.map(l => l.join("   ")).join("\n");

    const match = (a, b, c) => a === b && b === c;
    const gagne =
      match(grille[0][0], grille[0][1], grille[0][2]) ||
      match(grille[1][0], grille[1][1], grille[1][2]) ||
      match(grille[2][0], grille[2][1], grille[2][2]) ||
      match(grille[0][0], grille[1][0], grille[2][0]) ||
      match(grille[0][1], grille[1][1], grille[2][1]) ||
      match(grille[0][2], grille[1][2], grille[2][2]) ||
      match(grille[0][0], grille[1][1], grille[2][2]) ||
      match(grille[0][2], grille[1][1], grille[2][0]);

    if (gagne) {
      const gain = Math.floor(Math.random() * 5000);
      await modifierSolde(auteur_Message, "portefeuille", gain * 2);
      return repondre(`🎰 *Résultat*\n${afficher}\n\n🎉 *Jackpot ! Tu gagnes ${gain * 2} 🪙*`);
    } else {
      const perte = Math.floor(Math.random() * 300);
      await modifierSolde(auteur_Message, "portefeuille", -perte);
      return repondre(`🎰 *Résultat*\n${afficher}\n\n📉 *Tu perds ${perte} 🪙...*`);
    }
  }
);

ovlcmd({
  nom_cmd: "slot2",
  desc: "Joue à la machine à sous spéciale weekend",
  react: "🎰",
  classe: "Économie"
},
async (ms_org, ovl, { auteur_Message, repondre, prefixe }) => {
  const jour = new Date().getDay();
  if (![5, 6, 0].includes(jour)) return repondre("🎮 Tu peux jouer uniquement pendant le weekend : *vendredi, samedi, dimanche*.");

  const { portefeuille } = await getInfosUtilisateur(auteur_Message);
  const mise = parseInt(ovl.split(" ")[0]) || 100;

  if (mise > portefeuille) return repondre(`💰 Tu n'as que *${portefeuille} 🪙* dans ton portefeuille.`);

  const fruits = ["🥥", "🍎", "🍇", "🍍"];
  const getFruit = () => fruits[Math.floor(Math.random() * fruits.length)];
  const f1 = getFruit(), f2 = getFruit(), f3 = getFruit();

  const messages = {
    jackpot: "*🎊 JACKPOT ! 🎊*\n\n🤑 Tu gagnes *x100* ta mise !",
    triple: "*🎉 BRAVO !*\n\nTu as eu 3 fruits identiques 🍒🍒🍒 ! Tu gagnes *x3* ta mise.",
    double: "*😊 Bien joué !*\n\nDeux fruits identiques, tu gagnes *x1.5* ta mise.",
    perte: "*😓 Perdu !*\n\nAucun fruit identique... Tu perds ta mise."
  };

  let multiplicateur = 0;
  let message = "";

  if (f1 === "🍇" && f2 === "🍇" && f3 === "🍇") {
    multiplicateur = 100;
    message = messages.jackpot;
  } else if (f1 === f2 && f2 === f3) {
    multiplicateur = 3;
    message = messages.triple;
  } else if (f1 === f2 || f2 === f3 || f1 === f3) {
    multiplicateur = 1.5;
    message = messages.double;
  } else {
    multiplicateur = 0;
    message = messages.perte;
  }

  const gain = Math.floor(mise * multiplicateur);
  const variation = gain - mise;

  // Appliquer le gain ou la perte
  await modifierSolde(auteur_Message, "portefeuille", variation);

  const signe = variation >= 0 ? "gagnes" : "perds";
  const absVar = Math.abs(variation);

  await repondre(`🎰 *Résultat :*\n\n${f1}  ${f2}  ${f3}\n\n${message}\n\n📊 Tu ${signe} *${absVar} 🪙*.`);
});
