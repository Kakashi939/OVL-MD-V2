## `OVL-MD-V2`

<p align="center"> 
    <img alt="OVL" src="https://files.catbox.moe/k1gddi.jpg">
</p>

<p align="center">
    Un bot WhatsApp multi-appareil open source. N'oubliez pas de laisser une ⭐ (star) pour le projet.
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
    </a>
    <a href="https://github.com/WhiskeySockets/Baileys">
        <img src="https://img.shields.io/badge/Baileys-Web%20API-orange?style=flat-square" alt="Using Baileys Web API" />
    </a>
    <a href="https://github.com/Ainz-devs/OVL-MD-V2/stargazers">
        <img src="https://img.shields.io/github/stars/Ainz-devs/OVL-MD-V2?style=flat-square" alt="Stars" />
    </a>
    <a href="https://github.com/Ainz-devs/OVL-MD-V2/network/members">
        <img src="https://img.shields.io/github/forks/Ainz-devs/OVL-MD-V2?style=flat-square" alt="Forks" />
    </a>
</p>

<details>
  <summary>Déploiement de OVL-MD-V2</summary>
  
### Étape 1 : Créer un fork du projet
- Cliquez ici [OVL-MD-FORK](https://github.com/Ainz-fkk/OVL-MD/fork).

### Étape 2 : Obtenir une SESSION-ID
- Cliquez ici [SESSION-ID](https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app/).
- **Remarque** : Conservez cette SESSION-ID en sécurité, car elle est nécessaire pour connecter le bot à votre compte WhatsApp.

### Étape 3 : Créer une base de données
- Cliquez ici pour créer: [DATA-BASE](https://supabase.com)
- Si vous en avez déjà une c'est plus la peine d'en créer

### Étape 4 : Déployer OVL-MD

### Deployer sur Render
- **Creer une compte:** [compte-render](https://dashboard.render.com/register).
- **Deployer:** [Deployer sur Render](https://dashboard.render.com/web/new)

### Deployer sur Koyeb
- **Creer un compte:** [compte-koyeb](https://app.koyeb.com/auth/signup) 
- **Deployer:** [Deployer sur Koyeb](https://app.koyeb.com/deploy?name=ovl-md&repository=Ainz-fkk%2FOVL-MD&branch=main&builder=dockerfile&instance_type=free&instances_min=0&autoscaling_sleep_idle_delay=300&env%5BLEVEL_UP%5D=non&env%5BMENU%5D=https%3A%2F%2Fi.ibb.co%2Fynx9QcZ%2Fimage.jpg&env%5BMODE%5D=public&env%5BNOM_OWNER%5D=Ainz&env%5BNUMERO_OWNER%5D=226xxxxxxxx&env%5BPREFIXE%5D=%F0%9F%97%BF&env%5BSESSION_ID%5D=Ovl-MD_qLA7XFLP_SESSION-ID&env%5BSTICKER_AUTHOR_NAME%5D=OVL-MD&env%5BSTICKER_PACK_NAME%5D=Wa-sticker)
 
### Deployer sur panel
- **Créer un compte:** [compte-panel](https://bot-hosting.net) 
- **Deployer:**
- Étape 1: créer un serveur
- Étape 2: créer une fichier ```index.js``` ou ```main.js``` sur le serveur
- Étape 3: Démarrer le bot

### Deployer sur GitHub
- Étape 1: Créer un fichier «.env» directement dans votre fork, puis entre vos informations
- Étape 2: Créer un fichier «.github/workflows/deploy.yml», puis validé les changements

</details>

<details>
  <summary>Fichier index-panel</summary>
    ```sh
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const env_file = ``; //Entrée votre fichier .env ici

if (!env_file.trim()) {
  console.error("Aucune donnée de configuration trouvée dans 'env_file'. Veuillez remplir vos informations dans le code.");
  process.exit(1);
}

const envPath = path.join(__dirname, 'ovl', '.env');

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) {
    throw new Error(`Échec de l'exécution de "${command} ${args.join(' ')}" : ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Commande "${command} ${args.join(' ')}" retournée avec le code ${result.status}`);
  }
}

if (!existsSync('ovl')) {
  console.log("Clonage du bot en cours...");
  runCommand('git', ['clone', 'https://github.com/Ainz-fkk/OVL-MD', 'ovl']);
  console.log("Clonage terminé, installation des dépendances...");
  runCommand('npm', ['install'], { cwd: 'ovl' });
  console.log("Dépendances installées avec succès !");
}

if (!existsSync(envPath)) {
  try {
    const envDir = path.dirname(envPath);
    if (!existsSync(envDir)) {
      mkdirSync(envDir, { recursive: true });
      console.log(`Répertoire créé: ${envDir}`);
    }
    writeFileSync(envPath, env_file.trim());
    console.log("Fichier .env créé avec succès !");
  } catch (error) {
    console.error(`Erreur lors de la création du fichier .env : ${error.message}`);
    process.exit(1);
  }
}

console.log("Démarrage du bot...");
runCommand('npm', ['run', 'Ovl'], { cwd: 'ovl' });
console.log("Le bot est en cours d'exécution...");
```
</details>

<details>
  <summary>Fichier `.github/workflows/deploy.yml`</summary>
  ```sh
name: OVL-MD Bot CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: '0 */5 * * *'

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Récupération du dépôt
        uses: actions/checkout@v3

      - name: Configuration de Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Installation des dépendances + ffmpeg
        run: |
          sudo apt update
          sudo apt install -y ffmpeg
          npm i

      - name: Démarrage du bot
        run: |
          timeout 18300s npm run Ovl
```
</details>

<details>
  <summary> **Exemple de fichier `.env`:**</summary>
 ```sh
PREFIXE=
NOM_OWNER=Ainz
NUMERO_OWNER=226xxxxxxxx
MODE=public
MENU=https://i.ibb.co/ynx9QcZ/image.jpg
SESSION_ID=ovl
DATABASE=
LEVEL_UP=non
STICKER_PACK_NAME=Wa-sticker
STICKER_AUTHOR_NAME=OVL-MD
RENDER_API_KEY=
```
</details>

> ⚠️ **Utilisation à vos risques et périls**  
> L'utilisation de cet outil doit se faire avec précaution. **WhatsApp interdit strictement l’usage de solutions automatisées non officielles** telles que les bots, scripts, ou clients modifiés, ce qui peut entraîner **des suspensions de compte, voire des poursuites**.  
>  
> ⚠️ Soyez également attentif aux tentatives d'escroquerie ou d'ingénierie sociale. **Les développeurs du projet ne vous demanderont jamais votre session WhatsApp ou des informations personnelles.**  
>  
> En utilisant ce projet, vous acceptez pleinement les risques et conséquences qui peuvent en découler.

---

### 👨‍💻 Développeur Principal
- **Ainz**

### 🤝 Contributeurs
- Haibo_lugh

### 📄 License

Ce projet est sous la licence MIT. Consultez le fichier LICENSE pour plus de détails.
