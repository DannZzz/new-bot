const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	name: "claim-token",
	category: 4,
	data: new SlashCommandBuilder()
	.setName("токен")
	.setDescription("Забрать токены."),
	run: async (client, int, Data) => {
		const { util, embed, db, F, emoji, weapons, rewards, config } = Data;

		const data = await db.findOrCreate("profile", int.user.id);

		await db.tokens(int.user.id, rewards.tokenDefault);

		embed(int).setSuccess(`Ты получаешь ${emoji.token}\`${rewards.tokenDefault}\``).send();
	}
}
