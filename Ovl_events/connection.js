module.export = async connection_update (con) => {
    const { connection, lastDisconnect } = con;

    if (connection === "connecting") {
        console.log("🌐 Connexion à WhatsApp en cours...");
    } else if (connection === 'open') {
        console.log("✅ Connexion établie ; Le bot est en ligne 🌐\n\n");
        
        console.log("Chargement des commandes...\n");
        const commandes = fs.readdirSync(path.join(__dirname, "commandes")).filter(fichier => path.extname(fichier).toLowerCase() === ".js");
        
        for (const fichier of commandes) {
            try {
                require(path.join(__dirname, "commandes", fichier));
                console.log(`${fichier} installé avec succès`);
                await  delay(300); // Pause de 300 ms
            } catch (e) {
                console.log(`Erreur lors du chargement de ${fichier} :    ${e}`);
            }
        }
        delay(700);
      let start_msg = `╭────《 OVL-MD 》─────⊷
⫸  *Préfixe*       : ${prefixe}
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
                 main()
                }
    }
};
