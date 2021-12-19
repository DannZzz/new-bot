const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
	.setName("claim")
	.setDescription("Claim your hourly gift!"),
	run: async (client, int, Data) => {
		const { util, embed, db, F, emoji, weapons, rewards, config } = Data;

		const data = await db.findOrCreate("profile", int.user.id);

		if (data.cooldowns.claim && data.cooldowns.claim > new Date()) {
			const time = F.getTime(data.cooldowns.claim);
			return embed(int).setError(`Try again in ${time.minutes} min. ${time.seconds} sec.`).send();
		}

		const rewardArr = ["apple", "coins", "weapon"];
		const item = rewardArr[Math.floor(Math.random() * rewardArr.length)];

		await db.models.profile.updateOne({_id: int.user.id}, {$set: {"cooldowns.claim": new Date(Date.now() + 3600 * 1000 )} });

		switch (item) {
			case "apple": {
				const reward = util.random(rewards.claimApple-20, rewards.claimApple+20);
				await db.models.profile.updateOne({_id: int.user.id}, {$inc: {apples: reward}});
				return embed(int).setSuccess(`You successfully claimed your hourly gift: ${emoji.apple}\`${reward}\``).send();
			}
			case "coins": {
				const reward = util.random(rewards.claim-5, rewards.claim+5);
				await db.models.profile.updateOne({_id: int.user.id}, {$inc: {coins: reward}});
				return embed(int).setSuccess(`You successfully claimed your hourly gift: ${emoji.coin}\`${reward}\``).send();
			}
			case "weapon": {
				const game = await db.findOrCreate("game", int.user.id);
				const bag = game.bag || [];

				const weapon = weapons.method.randomWeapon();
				if (bag.length + 1 > config.MAX_BAG_COUNT) return embed(int).setError(`Bruhhh you got ${weapon.emoji}, but you had not enough space in bag!!!`).send();

				await db.models.game.updateOne({_id: int.user.id}, {$set: {bag: [weapon.id, ...bag]}});

				return embed(int).setSuccess(`Congrats!!! You got ${weapon.emoji}.`).send();
			}

		}


	}
}
