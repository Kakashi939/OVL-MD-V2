const fs = require('fs');
const { delay, DisconnectReason } = require("ovl_wa_baileys");
let evt = require("../lib/ovlcmd");
const config = require("../set");

async function connection_update(con, ovl, main) {
    const { connection, lastDisconnect } = con;

    if (connection === "connecting") {
        console.log("🌐 Connexion à WhatsApp en cours...");
    } else if (connection === 'open') {
        console.log("✅ Connexion établie ; Le bot est en ligne 🌐\n\n");
        
        console.log("Chargement des commandes...\n");
        const commandes = fs.readdirSync("../cmd").filter(fichier => path.extname(fichier).toLowerCase() === ".js");
        
        for (const fichier of commandes) {
            try {
                require(`../cmd/${fichier}`);
                console.log(`${fichier} installé avec succès`);
                await delay(300); // Pause de 300 ms
            } catch (e) {
                console.log(`Erreur lors du chargement de ${fichier} :    ${e}`);
            }
        }
        await delay(700);

        let start_msg = `╭────《 OVL-MD 》─────⊷
⫸  *Préfixe*       : ${config.prefixe}
⫸  *Mode*          : ${config.MODE}
⫸  *Commandes*     : ${evt.cmd.length}

             𝙈𝙖𝙙𝙚 𝙗𝙮 Ainz`;

        if (ovl.user && ovl.user.id) {
            await ovl.sendMessage(ovl.user.id, { text: start_msg });
        }
    } else if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut) {
            console.log('Connexion fermée: Déconnecté');
        } else {
            console.log('Connexion fermée: Reconnexion en cours...');
            main();
        }
    }
};

module.exports = connection_update;
