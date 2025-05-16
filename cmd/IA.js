const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");

ovlcmd(
    {
        nom_cmd: "gpt",
        classe: "IA",
        react: "💬",
        desc: "Utilise GPT-4 pour répondre à des questions"
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un texte ou une description d'image." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = "https://nexra.aryahcr.cc/api/chat/gpt";

        try {
            const result = await axios.post(apiUrl, {
                messages: [
                    { role: "user", content: prompt }
                ],
                prompt: "Répondre à l'utilisateur.",
                model: "GPT-4",
                markdown: false
            }, {
                headers: { 'Content-Type': 'application/json'}
            });

            const id = result.data.id;

            let response = null;
            let data = true;

            while (data) {
                response = await axios.get(`https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(id)}`);
                response = response.data;

                switch (response.status) {
                    case "pending":
                        data = true;
                        break;
                    case "error":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors du traitement de la requête." }, { quoted: ms });
                    case "completed":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: response.gpt || "Aucune réponse générée." }, { quoted: ms });
                    case "not_found":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: "Tâche introuvable. Veuillez réessayer." }, { quoted: ms });
                }
            }
        } catch (error) {
            console.error("Erreur :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "dalle",
        classe: "IA",
        react: "🎨",
        desc: "Génère des images avec DALLE-E."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer une description pour générer une image." }, { quoted: ms });
        }

        try {
            const prompt = encodeURIComponent(arg.join(" ")); // Encodage de l'URL
            const rep = await axios.get(`https://bk9.fun/ai/fluximg?q=${prompt}`);
            
            if (!rep.data?.BK9?.length) {
                throw new Error("Aucune image trouvée.");
            }

            const url = rep.data.BK9[0];

            return ovl.sendMessage(ms_org, { image: { url: url }, caption: `\`\`\`Powered By OVL-MD\`\`\`` }, { quoted: ms });
        } catch (err) {
            console.error("Erreur lors de la génération de l'image :", err);
            return ovl.sendMessage(ms_org, { text: "❌ Erreur lors de la génération de l'image. Réessayez plus tard." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "blackbox",
        classe: "IA",
        react: "🖤",
        desc: "Utilise Blackbox pour répondre aux questions."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un texte ou une question." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = "https://nexra.aryahcr.cc/api/chat/complements";

        try {
            const result = await axios.post(apiUrl, {
                messages: [{ role: "user", content: prompt }],
                prompt: "Répondre à l'utilisateur.",
                websearch: false,
                stream: false,
                markdown: false,
                model: "blackbox"
            }, {
                headers: { 'Content-Type': 'application/json'}
            });

            const id = result.data.id;
            let response = null;
            let data = true;

            while (data) {
                response = await axios.get(`https://nexra.aryahcr.cc/api/chat/task/${encodeURIComponent(id)}`);
                response = response.data;

                switch (response.status) {
                    case "pending":
                        data = true;
                        break;
                    case "error":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors du traitement de la requête." }, { quoted: ms });
                    case "completed":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: response.message || "Aucune réponse générée." }, { quoted: ms });
                    case "not_found":
                        data = false;
                        return ovl.sendMessage(ms_org, { text: "Tâche introuvable. Veuillez réessayer." }, { quoted: ms });
                }
            }
        } catch (error) {
            console.error("Erreur :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "lenna",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Lenna pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://fgsi1-restapi.hf.space/api/ai/lenna?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "copilot",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Copilot pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://fgsi1-restapi.hf.space/api/ai/copilot?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.data.answer) {
                const responseText = result.data.data.answer;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "deepseek",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Deepseek pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.ryzumi.vip/api/ai/deepseek?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.answer) {
                const responseText = result.data.answer;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "gemini",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Gemini-Pro pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.ryzumi.vip/api/ai/gemini?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.answer) {
                const responseText = result.data.answer;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API Gemini-Pro." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API Gemini-Pro :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "llama",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Llama pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.gurusensei.workers.dev/llama?prompt=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.response) {
                const responseText = result.data.response.response;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API Llama." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API Llama :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "bard",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Bard pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.diioffc.web.id/api/ai/bard?query=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.result) {
                const responseText = result.data.result.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API Bard." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API Bard :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "mixtral",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Mistral pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.kenshiro.cfd/api/ai/mixtral?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.data.response) {
                const responseText = result.data.data.response;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API Bard." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API Mixtral :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "groq",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Bard pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.kenshiro.cfd/api/ai/groq?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.data.response) {
                const responseText = result.data.data.response;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API groq." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API groq :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "zetaa",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Zetaa pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/zetaa?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'api :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "riple",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Riple pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/riple?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "muslim",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Muslim pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/muslim?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API:", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "lumin",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Lumin pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/lumin?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "lily",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Lily pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/lily?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "hoshinoo",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Hoshinoo pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;

        // Vérification si l'utilisateur a fourni un prompt
        if (!arg.length) {
            return ovl.sendMessage(ms_org, { text: "Veuillez entrer un prompt pour générer une réponse." }, { quoted: ms });
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.crafters.biz.id/ai/hoshinoo?text=${encodeURIComponent(prompt)}`;

        try {
            // Appel à l'API pour obtenir la réponse
            const result = await axios.get(apiUrl);

            if (result.data && result.data.message) {
                const responseText = result.data.message;
                return ovl.sendMessage(ms_org, { text: responseText }, { quoted: ms });
            } else {
                return ovl.sendMessage(ms_org, { text: "Erreur de réponse de l'API." }, { quoted: ms });
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de l'appel à l'API." }, { quoted: ms });
        }
    }
);
