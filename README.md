<h1 align="center">OVL-MD-V2</h1>

<p align="center"> 
    <img alt="OVL" src="https://files.catbox.moe/gxcb9p.jpg">
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

---

<details>
  <summary>🚀 Déploiement de OVL-MD-V2</summary>

### Étape 1 : Fork du dépôt GitHub
- 👉 [Créer un fork ici](https://github.com/Ainz-fkk/OVL-MD/fork)

### Étape 2 : Générer une SESSION ID
- 🔐 [Obtenir une SESSION-ID](https://quickest-elise-ainz-oest-org-53269c8e.koyeb.app)
- 📌 Conservez-la en lieu sûr.

### Étape 3 : Créer une base de données
- 🛠️ [Créer une base Supabase](https://supabase.com)
- Ou utilisez une existante.

### 🚀 Étape 4 : Méthodes de déploiement

#### <img src="https://img.shields.io/badge/Render-12100E?style=for-the-badge&logo=render&logoColor=white" height="28" />  
- Créez un compte : [Lien Render](https://dashboard.render.com/register)  
- Déploiement rapide : [Déployer sur Render](https://dashboard.render.com/web/new)

#### <img src="https://img.shields.io/badge/Koyeb-000000?style=for-the-badge&logo=koyeb&logoColor=white" height="28" />  
- Créez un compte : [Lien Koyeb](https://app.koyeb.com/auth/signup)  
- Déploiement rapide : [Déployer sur Koyeb](https://app.koyeb.com/deploy?type=git&name=ovl-md&repository=https%3A%2F%2Fgithub.com%2FAinz-devs%2FOVL-MD-V2&branch=main&builder=dockerfile&env[PREFIXE]=%F0%9F%97%BF&env[NOM_OWNER]=Ainz&env[NUMERO_OWNER]=226xxxxxxxx&env[MODE]=public&env[MENU]=https%3A%2F%2Fi.ibb.co%2Fynx9QcZ%2Fimage.jpg&env[SESSION_ID]=ovl&env[DATABASE]=&env[LEVEL_UP]=non&env[STICKER_PACK_NAME]=Wa-sticker&env[STICKER_AUTHOR_NAME]=OVL-MD)

#### <img src="https://img.shields.io/badge/Panel-grey?style=for-the-badge&logo=windows-terminal&logoColor=white" height="28" />  
- Créez un serveur  
- Ajoutez le fichier `index.js` ou `main.js`
- Démarrez le bot

#### <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" height="28" />  
- Ajoutez un fichier `.env`  
- Créez le fichier `.github/workflows/deploy.yml`

</details>

---

<details>
  <summary>📝 Fichier index.js ou main.js pour déploiement sur panel</summary>

```js
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const env_file = ``; // Ajoutez ici vos variables d'environnement

if (!env_file.trim()) {
  console.error("Aucune donnée de configuration dans 'env_file'. Remplissez les infos.");
  process.exit(1);
}

const envPath = path.join(__dirname, 'ovl', '.env');

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error || result.status !== 0) {
    throw new Error(`Erreur lors de l'exécution : ${command}`);
  }
}

if (!existsSync('ovl')) {
  console.log("Clonage...");
  runCommand('git', ['clone', 'https://github.com/Ainz-fkk/OVL-MD', 'ovl']);
  runCommand('npm', ['install'], { cwd: 'ovl' });
}

if (!existsSync(envPath)) {
  mkdirSync(path.dirname(envPath), { recursive: true });
  writeFileSync(envPath, env_file.trim());
}

runCommand('npm', ['run', 'Ovl'], { cwd: 'ovl' });
```

</details>

---

<details>
  <summary>⚙️ Fichier .github/workflows/deploy.yml</summary>

```yaml
name: OVL-MD Bot CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */5 * * *'

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: |
          sudo apt update
          sudo apt install -y ffmpeg
          npm i
      - run: timeout 18300s npm run Ovl
```

</details>

---

<details>
  <summary>🔐 Exemple de fichier .env</summary>

```env
PREFIXE=🗿
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

---
<details>
  <summary>⚠️ Important</summary>

<br>

> **Utilisation à vos risques et périls**  
> ⚠️ L'utilisation de cet outil doit se faire avec précaution. **WhatsApp interdit strictement l’usage de solutions automatisées non officielles** telles que les bots, scripts, ou clients modifiés, ce qui peut entraîner **des suspensions de compte, voire des poursuites**.  
>  
> 🔐 Soyez également attentif aux tentatives d'escroquerie ou d'ingénierie sociale. **Ne partagez pas votre session WhatsApp ni des informations personnelles.**  
>  
> ✅ En utilisant ce projet, vous acceptez pleinement les risques et conséquences qui peuvent en découler.

</details>

---

### 👨‍💻 Développeur Principal
- **Ainz**
---
### 🙌 Remerciements
- Haibo_lugh – pour son soutien et aide dans la gestion du bot au support.
---
### 📄 Licence

Distribué sous la licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.

