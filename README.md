## `OVL-MD-V2`

<p align="center"> 
    <img alt="OVL" src="https://files.catbox.moe/k1gddi.jpg">
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
    </a>
    <a href="https://github.com/WhiskeySockets/Baileys">
        <img src="https://img.shields.io/badge/Baileys-Web%20API-orange?style=flat-square" alt="Using Baileys Web API" />
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

### Étape 4 : Méthodes de déploiement

#### ☁️ Render
- Créez un compte : [Lien Render](https://dashboard.render.com/register)
- Lancez le déploiement : [Déployer sur Render](https://dashboard.render.com/web/new)

#### ☁️ Koyeb
- Créez un compte : [Lien Koyeb](https://app.koyeb.com/auth/signup)
- Déploiement rapide : [Déployer sur Koyeb](https://app.koyeb.com/deploy?name=ovl-md&repository=Ainz-fkk%2FOVL-MD&branch=main...)

#### 🔧 Panel 
- Créez un serveur
- Ajoutez `index.js` `ou main.js`
- Démarrez le bot

#### 🛠️ GitHub Actions
- Ajoutez un fichier `.env`
- Créez un fichier `.github/workflows/deploy.yml`

</details>

---

<details>
  <summary>📝 Fichier `index.js` pour déploiement sur panel</summary>

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
  <summary>⚙️ Fichier `.github/workflows/deploy.yml`</summary>

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
  <summary>🔐 Exemple de fichier `.env`</summary>

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

> ⚠️ **Utilisation à vos risques**
>
> L'usage d’outils non officiels pour interagir avec WhatsApp est **interdit par leurs conditions d’utilisation**. Cela peut entraîner **des suspensions de compte ou d'autres conséquences**.
>
> Ne communiquez jamais votre session à qui que ce soit. Ce projet est à des fins d’apprentissage et d’expérimentation.  
> **En l’utilisant, vous acceptez les risques associés.**

---

### 📄 Licence

Distribué sous la licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.
