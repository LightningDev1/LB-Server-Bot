const client = require("../index");
client.on("ready", () => {
  console.log(`\x1b[32m[+] \x1b[0mLightningBot is online`);
  client.user.setActivity(
    {
      type: client.config.STATUS.TYPE,
      name: client.config.STATUS.TEXT
    }
  )
})
