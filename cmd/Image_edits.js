const fs = require("fs");
const { ovlcmd } = require("../framework/ovlcmd");
const canvacord = require("canvacord");
const axios = require("axios");

async function telechargerImage(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw new Error("Impossible de télécharger l'image.");
  }
}

function genererCommandeCanvacord(nomCommande, effet) {
  ovlcmd(
    {
      nom_cmd: nomCommande,
      classe: "Image_Edits",
      react: "🎨",
      desc: "Applique un effet sur une image",
    },
    async (ms_org, ovl, options) => {
      const { arg, ms, auteur_Msg_Repondu, msg_Repondu, auteur_Message } = options;

      try {
        let imageBuffer;
        const cible =
          auteur_Msg_Repondu ||
          (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteur_Message;

        if (msg_Repondu?.imageMessage) {
          const cheminFichier = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
          imageBuffer = fs.readFileSync(cheminFichier); // 🔥 Lire le fichier en Buffer
        } else if (cible) {
          try {
            imageBuffer = await telechargerImage(await ovl.profilePictureUrl(cible, "image"));
          } catch {
            imageBuffer = await telechargerImage("https://files.catbox.moe/ulwqtr.jpg");
          }
        } else {
          imageBuffer = await telechargerImage("https://files.catbox.moe/ulwqtr.jpg");
        }

        const resultat = await effet(imageBuffer);

        await ovl.sendMessage(ms_org, { image: resultat }, { quoted: ms });
      } catch (error) {
        console.error(`Erreur avec la commande "${nomCommande}":`, error);
      }
    }
  );
}

const effetsCanvacord = {
  shit: (img) => canvacord.canvacord.shit(img),
  wasted: (img) => canvacord.canvacord.wasted(img),
  wanted: (img) => canvacord.canvacord.wanted(img),
  trigger: (img) => canvacord.canvacord.trigger(img),
  trash: (img) => canvacord.canvacord.trash(img),
  rip: (img) => canvacord.canvacord.rip(img),
  sepia: (img) => canvacord.canvacord.sepia(img),
  rainbow: (img) => canvacord.canvacord.rainbow(img),
  hitler: (img) => canvacord.canvacord.hitler(img),
  invert: (img) => canvacord.canvacord.invert(img),
  jail: (img) => canvacord.canvacord.jail(img),
  affect: (img) => canvacord.canvacord.affect(img),
  beautiful: (img) => canvacord.canvacord.beautiful(img),
  blur: (img) => canvacord.canvacord.blur(img),
  circle: (img) => canvacord.canvacord.circle(img),
  facepalm: (img) => canvacord.canvacord.facepalm(img),
  greyscale: (img) => canvacord.canvacord.greyscale(img),
  jokeoverhead: (img) => canvacord.canvacord.jokeOverHead(img),
  slap: (img) => canvacord.canvacord.slap(img),
  spank: (img) => canvacord.canvacord.spank(img),
  kiss: (img) => canvacord.canvacord.kiss(img),
  delete: (img) => canvacord.canvacord.delete(img),
  bed: (img) => canvacord.canvacord.bed(img),
  distracted: (img) => canvacord.canvacord.distracted(img),
  colorfy: (img) => canvacord.canvacord.colorfy(img),
  filters: (img) => canvacord.canvacord.filters(img),
  fuse: (img) => canvacord.canvacord.fuse(img),
};

Object.entries(effetsCanvacord).forEach(([nom, effet]) =>
  genererCommandeCanvacord(nom, effet)
);
