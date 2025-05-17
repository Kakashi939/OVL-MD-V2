const { WA_CONF } = require('../../DataBase/wa_conf');

async function like_status(ovl, ms, ms_org, id_Bot) {
    const settings = await WA_CONF.findOne({ where: { id: '1' } });
    if (settings) {
        if (ms_org === "status@broadcast" && settings.like_status !== "non" && settings.like_status) {
            const emoji = settings.like_status;
            await ovl.sendMessage(ms_org, { 
                react: { 
                    key: ms.key, 
                    text: emoji 
                } 
            }, { 
                statusJidList: [ms.key.participant, id_Bot], 
                broadcast: true 
            });
        }
    }
}

module.exports = like_status;
