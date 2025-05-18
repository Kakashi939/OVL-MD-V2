const fs = require('fs');
const path = require('path');
const { delay, DisconnectReason } = require("ovl_wa_baileys");
let evt = require("../lib/ovlcmd");
const config = require("../set");

async function connection_update(con, ovl, main) {
    const { connection, lastDisconnect } = con;

    if (connection === "connecting") {
        console.log("🌐 Connexion à WhatsApp en cours...");
    } 
    
    else if (connection === 'open') {
        console.log("✅ Connexion établie ; Le bot est en ligne 🌐\n");
        
        console.log("Chargement des commandes...\n");
        const commandes = fs.readdirSync(path.join(__dirname, "../cmd"))
            .filter(fichier => path.extname(fichier).toLowerCase() === ".js");

        for (const fichier of commandes) {
            try {
                const cheminComplet = path.join(__dirname, "../cmd", fichier);
                require(cheminComplet);
                console.log(`${fichier} installé avec succès`);
                await delay(300);
            } catch (e) {
                console.log(`Erreur lors du chargement de ${fichier} : ${e}`);
            }
        }

        await delay(700);
        const start_msg = `߷ Etat ➽ Connecté✅
߷ Préfixe ➽ ${config.PREFIXE}
߷ Mode ➽ ${config.MODE}
߷ cmds ➽ ${evt.cmd.length}
߷ Version ➽ 2.0.0
߷ Développeur ➽  Ainz`;

        if (ovl.user && ovl.user.id) {
            await ovl.sendMessage(ovl.user.id, { text: start_msg });
        }
    } 
    
    else if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) {
            console.log('❌ Connexion fermée: Déconnecté');
        } else {
            console.log('⚠️ Connexion fermée: Reconnexion en cours...');
            main();
        }
    }
}

module.exports = connection_update;
