const axios = require("axios");
const { ovlcmd } = require("../lib/ovlcmd");
const config = require('../set');
const os = require('os');
const { execSync } = require("child_process");
const RENDER_API_KEY = config.RENDER_API_KEY;
const host = os.hostname();
const SERVICE_ID = host.split("-hibernate")[0]; 

const headers = {
  Authorization: `Bearer ${RENDER_API_KEY}`,
  "Content-Type": "application/json",
};

function checkConfig() {
  if (!RENDER_API_KEY) {
    return "*Erreur :* La variable `RENDER_API_KEY` doivent être définies dans la configuration.";
  }
  return null;
}

async function manageEnvVar(action, key, value = null) {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
      { headers }
    );
    let envVars = response.data.map((v) => ({ key: v.envVar.key, value: v.envVar.value }));

    if (action === "setvar") {
      const existingVar = envVars.find((v) => v.key === key);

      if (existingVar) {
        existingVar.value = value;
      } else {
        envVars.push({ key, value });
      }

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        envVars,
        { headers }
      );
      return `✨ *Variable définie avec succès !*\n📌 *Clé :* \`${key}\`\n📥 *Valeur :* \`${value}\``;

    } else if (action === "delvar") {
      envVars = envVars.filter((v) => v.key !== key);

      await axios.put(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        envVars,
        { headers }
      );
      return `✅ *Variable supprimée avec succès !*\n📌 *Clé :* \`${key}\``;

    } else if (action === "getvar") {
      if (key === "all") {
        if (envVars.length === 0) return "📭 *Aucune variable disponible.*";

        const allVars = envVars
          .map((v) => `📌 *${v.key}* : \`${v.value}\``)
          .join("\n");
        return `✨ *Liste des variables d'environnement :*\n\n${allVars}`;
      }

      const envVar = envVars.find((v) => v.key === key);
      return envVar
        ? `📌 *${key}* : \`${envVar.value}\``
        : `*Variable introuvable :* \`${key}\``;
    }
  } catch (error) {
    console.error(error);
    return `*Erreur :* ${error.response?.data?.message || error.message}`;
  }
}

async function restartRenderService() {
  const configError = checkConfig();
  if (configError) return configError;

  try {
    await axios.post(
        `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
        {},
        { headers }
      );
    return "✅ Le service a été redémarré avec succès !";
  } catch (error) {
    console.error(error);
    return `*Erreur :* ${error.response?.data?.message || error.message}`;
  }
}

async function getRenderCommit() {
  try {
    const response = await axios.get(
      `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
      { headers }
    );
    
    if (!response.data || response.data.length === 0) {
      throw new Error("Aucun déploiement trouvé sur Render.");
    }
    
    const lastDeploy = response.data[0];
    const lastCommit = lastDeploy.deploy.commit;
    
    return lastCommit ? lastCommit.id : null;
  } catch (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le dernier commit déployé sur Render.");
  }
}

function getGitCommit() {
  try {
    return execSync("git log -1 --pretty=format:%H", {
      cwd: ".",
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    console.error("Erreur lors de la récupération du commit:", error.message);
    return null;
  }
}

async function deployRender() {
  try {
    await axios.post(
      `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
      {},
      { headers }
    );
    return "✅ Déploiement lancé avec succès....";
  } catch (error) {
    console.error(error);
    throw new Error("Échec du lancement du déploiement sur Render.");
  }
}

ovlcmd(
  {
    nom_cmd: "setvar",
    classe: "Render_config",
    desc: "Définit ou met à jour une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;
    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
        }, { quoted: ms });
    }
    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError,
        }, { quoted: ms });
    }
    if (!arg[0] || !arg.includes("=")) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `setvar clé = valeur`",
        }, { quoted: ms });
    }
    const [key, ...valueParts] = arg.join(" ").split("=");
    const value = valueParts.join("=").trim();
    const result = await manageEnvVar("setvar", key.trim(), value);
    await ovl.sendMessage(ms_org, {
      text: result,
      }, { quoted: ms });
    const restartResult = await restartRenderService();
    await ovl.sendMessage(ms_org, {
      text: restartResult,
       }, { quoted: ms });
    return;
  }
);

ovlcmd(
  {
    nom_cmd: "getvar",
    classe: "Render_config",
    desc: "Récupère la valeur d'une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;
    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
       }, { quoted: ms });
    }
    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError,
        }, { quoted: ms });
    }
    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `getvar clé` ou `getvar all` pour obtenir toutes les variables",
      }, { quoted: ms });
    }
    const key = arg[0];
    const result = await manageEnvVar("getvar", key);
    return ovl.sendMessage(ms_org, {
      text: result
    }, { quoted: ms });
  }
);

ovlcmd(
  {
    nom_cmd: "delvar",
    classe: "Render_config",
    desc: "Supprime une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;
    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium",
      }, { quoted: ms });
    }
    const configError = checkConfig();
    if (configError) {
      return ovl.sendMessage(ms_org, {
        text: configError
    }, { quoted: ms });
    }
      
    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `delvar clé`"
      }, { quoted: ms });
    }
    const key = arg[0];
    const result = await manageEnvVar("delvar", key);
    await ovl.sendMessage(ms_org, {
      text: result
       }, { quoted: ms });
    const restartResult = await restartRenderService();
    await ovl.sendMessage(ms_org, {
      text: restartResult
    }, { quoted: ms });
    return;
  }
);

ovlcmd(
  {
    nom_cmd: "update",
    classe: "Render_config",
    desc: "Vérifie et déploie la dernière version de l'application sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, prenium_id } = cmd_options;

    if (!prenium_id) {
      return ovl.sendMessage(ms_org, {
        text: "Cette commande est réservée aux utilisateurs premium"
      }, { quoted: ms });
    }

    if (!RENDER_API_KEY || !SERVICE_ID) {
      return ovl.sendMessage(ms_org, {
        text: "Erreur : Les informations de configuration pour Render (API Key et Service ID) ne sont pas définies. Merci de les ajouter."
      }, { quoted: ms });
    }

    try {
      const renderCommit = await getRenderCommit();
      const gitCommit = await getGitCommit();
    console.log(renderCommit, gitCommit);
   /*   if (renderCommit == gitCommit) {
        return ovl.sendMessage(ms_org, {
          text: "Le bot est déjà à jour",
        }, { quoted: ms });
      } else {*/
        const deployResult = await deployRender();
        return ovl.sendMessage(ms_org, {
          text: deployResult
        }, { quoted: ms });
  //    }
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, {
        text: `*Erreur* : ${error.message}`
      }, { quoted: ms });
    }
  }
);
