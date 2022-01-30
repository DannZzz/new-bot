const { SlashCommandBuilder } = require("@discordjs/builders");
const { Captcha } = require("captcha-canvas");
const tokenSet = new Set();

module.exports = {
	name: "claim-token",
	category: 4,
	data: new SlashCommandBuilder()
	.setName("токен")
	.setDescription("Забрать токены.")
	.addStringOption(o => o
		.setName("способ")
		.setDescription("Другие способы зарабатывать токены.")
		.addChoice("1. Каптча", "captcha")
	),
	run: async (client, int, Data) => {
		const { util, embed, db, F, emoji, weapons, rewards, config, Discord } = Data;

		const way = int.options.getString("способ");
		if (tokenSet.has(int.user.id)) return embed(int).setError("Ты ещё не закончил другое действие этой команды.").send("reply", true)

		const data = await db.findOrCreate("profile", int.user.id);

		if (way) {

			switch (way) {
				case "captcha": {
					tokenSet.add(int.user.id);
					const captcha = new Captcha();
					captcha.async = true //Sync
					captcha.drawCaptcha({"characters": 6}); //draw captcha text on captcha canvas.
					captcha.addDecoy(); //Add decoy text on captcha canvas.
					captcha.drawTrace(); //draw trace lines on captcha canvas.

					const attachment = new Discord.MessageAttachment(await captcha.png, "captcha.png")
					const emb = embed(int).setText(`Решите каптчу, награда: ${emoji.token}\`${rewards.tokenCaptcha}\``).setImage(`attachment://captcha.png`);
					console.log(captcha.text)
					int.reply({embeds: [emb], files: [attachment]});
					const collector = int.channel.createMessageCollector({
						filter: m => m.author.id === int.user.id,
						time: 30000
					});
					let bool = false;
					collector.on("end", () => {
						tokenSet.delete(int.user.id);
						if (!bool) return embed(int).setError("Время вышло!").send("followUp");
					});

					collector.on("collect", async message => {
						const msg = message.content;
						if (msg?.toLowerCase() === captcha.text.toLowerCase()) {
							bool = true;
							collector.stop();
							await db.tokens(int.user.id, rewards.tokenCaptcha);
							return embed(int).setSuccess(`Правильно! Ты получаешь: ${emoji.token}\`${rewards.tokenCaptcha}\``).setAuthor({name: int.user.username, iconURL: int.user.displayAvatarURL({dynamic: true})}).send("followUp")
						}
					})

				}
			}

			return;
		}

		await db.tokens(int.user.id, rewards.tokenDefault);

		return embed(int).setSuccess(`Ты получаешь ${emoji.token}\`${rewards.tokenDefault}\``).send();
	}
}
