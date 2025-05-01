if (ms_org === "status@broadcast" && settings.lecture_status === "oui") { 
    await ovl.readMessages([ms.key]);
}
