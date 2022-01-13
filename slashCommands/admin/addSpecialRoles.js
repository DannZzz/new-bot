const { SlashCommandBuilder } = require("@discordjs/builders");

const msToString = {
  "5m": "5 минут",
  "10m": "10 минут",
  "30m": "30 минут",
  "1h": "1 час",
  "2h": "2 часа",
  "3h": "3 часа",
  "6h": "6 часов",
  "12h": "12 часов",
  "1d": "1 день",
  "2d": "2 дня",
  "5d": "5 дней",
  "1w": "1 неделя"
}

module.exports = {
  name: "addSpecialRoles",
  category: 2,
  permissions: ['ADMINISTRATOR'],
  data: new SlashCommandBuilder()
  .setName("назначить")
  .setDescription("Назначить специальное роли, для модераторов, давать права банить, выгнать.")
  .addSubcommand(cmd => cmd
    .setName("модератор")
    .setDescription("Добавить/Убрать роль модератора!")
    .addRoleOption(o => o
      .setName("роль")
      .setDescription("Роль для модератора, участники с этой ролью могут замьютить и предупреждать других.")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("банер")
    .setDescription("Добавить/Убрать роль банера!")
    .addRoleOption(o => o
      .setName("роль")
      .setDescription("Роль для банера, участники с этой ролью могут забанить/разбанить участников.")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("кикер")
    .setDescription("Добавить/Убрать роль кикера!")
    .addRoleOption(o => o
      .setName("роль")
      .setDescription("Роль для кикера, участники с этой ролью могут выгонять участников.")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("мьют-по-количеству")
    .setDescription("Добавить/Убрать роль с количество доступных возможностей замьютить!")
    .addRoleOption(o => o
      .setName("роль")
      .setDescription("Участники с этой ролью могут замьютить по количеству в день, укажите 0 чтобы убрать роль.")
      .setRequired(true)
    )
    .addIntegerOption(o => o
      .setName("количество")
      .setDescription("Количество доступных мьютов в день.")
      .setRequired(true)
    )
    .addStringOption(o => o
      .setName("максимальный-срок")
      .setDescription("Назначить для этой роли максимальный срок выдачи мьюта. ")
      .addChoice("5 минут", "5m")
      .addChoice("10 минут", "10m")
      .addChoice("30 минут", "30m")
      .addChoice("1 час", "1h")
      .addChoice("2 часа", "2h")
      .addChoice("3 часа", "3h")
      .addChoice("6 часов", "6h")
      .addChoice("12 часов", "12h")
      .addChoice("1 день", "1d")
      .addChoice("2 дня", "2d")
      .addChoice("5 дней", "5d")
      .addChoice("1 неделя", "1w")

    )
  )
  ,
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db } = Data;

    const guild = int.guild;
    const user = int.user;
    const dataType = int.options.getSubcommand();
    const role = int.options.getRole("роль");
    const uses = int.options.getInteger("количество");
    const limit_for_mute = int.options.getString("максимальный-срок") || undefined;

    if (!role) embed(int).setError("Роль не найдена!").send();
    let obj = {
      "модератор": "moderrole",
      "банер": "banAllowedRoles",
      "кикер": "kickAllowedRoles"
    };

    const type = obj[dataType];

    if (dataType === "мьют-по-количеству") {
      if ((!serverData.premium || serverData.premium < new Date()) && serverData.temporaryRolesForMute && serverData.temporaryRolesForMute.length >= 2) {
        if (serverData?.temporaryRolesForMute?.length > 2) {
          await db.models.server.updateOne({_id: guild.id}, {$set: {temporaryRolesForMute: [serverData.temporaryRolesForMute[0], serverData.temporaryRolesForMute[1]]}});
        }
        return embed(int).setError('Чтобы добавлять больше ролей, ваш сервер должен быть **Премиум** сервером.').send();
      }
      if (serverData.temporaryRolesForMute && serverData.temporaryRolesForMute.length >= 20) return embed(int).setError("На этом сервере можете добавить максимум 20-и ролей.").send();

      if (uses < 0) return embed(int).setError(`Количество доступных мьютов должен быть 1 или больше, либо 0 чтобы убрать.`).send();

      if (serverData.temporaryRolesForMute && serverData.temporaryRolesForMute.length > 0) {
        const thisRoleIndex = serverData.temporaryRolesForMute.findIndex(roleObj => roleObj.id === role.id);
        if (thisRoleIndex < 0 && uses === 0) {
          return embed(int).setError(`Роль ${role} и так не имеет плюшек.`).send();
        } else if (thisRoleIndex < 0) {
          await db.models.server.updateOne({_id: guild.id}, {$set: {temporaryRolesForMute: [...serverData.temporaryRolesForMute, {id: role.id, uses, limit: limit_for_mute}]} });
          return embed(int).setSuccess(`Участники с ролью ${role} теперь могут замьютить участников ниже, **${uses}** раз(-а) в день, а максимальный срок: **${limit_for_mute ? msToString[limit_for_mute] : msToString["1w"]}**.`).send();
        } else {
          if (uses === 0) {
            serverData.temporaryRolesForMute.splice(thisRoleIndex, 1);
            await db.models.server.updateOne({_id: guild.id}, {$set: {temporaryRolesForMute: serverData.temporaryRolesForMute} });
            return embed(int).setSuccess(`Роль ${role} успешно убрана.`).send();
          } else {
            await db.models.server.updateOne({_id: guild.id}, {$set: {[`temporaryRolesForMute.${thisRoleIndex}.uses`]: uses, [`temporaryRolesForMute.${thisRoleIndex}.limit`]: limit_for_mute} });
            return embed(int).setSuccess(`Участники с ролью ${role} теперь могут замьютить участников ниже, **${uses}** раз(-а) в день, а максимальный срок: **${limit_for_mute ? msToString[limit_for_mute] : msToString["1w"]}**.`).send();
          }
        }
      } else {
        if (uses === 0) {
          return embed(int).setError(`Роль ${role} и так не имеет плюшек.`).send();
        }
        serverData.temporaryRolesForMute = [];
        serverData.temporaryRolesForMute.push({id: role.id, uses, limit: limit_for_mute});
        await serverData.save();
        return embed(int).setSuccess(`Участники с ролью ${role} теперь могут замьютить участников ниже, **${uses}** раз в день.`).send();
      }

      return;
    }

    if (!serverData[type]) serverData[type] = [];

    const roleIndexInBase = serverData[type].findIndex(roleId => roleId === role.id);

    if (roleIndexInBase >= 0) {
      serverData[type].splice(roleIndexInBase, 1);
      serverData.save();
      embed(int).setSuccess(`Роль ${role} убрана.`).send();
      return;
    } else {
      if (serverData[type].length >= 10 && !serverData.premium ) {
        return embed(int).setError("На этом сервере можете добавить максимум 10-и ролей, либо купите **Премиум**, чтобы добавлять до 20-и ролей.").send();
      } else if (serverData[type].length >= 20) return embed(int).setError("На этом сервере можете добавить максимум 20-и ролей.").send();
      serverData[type].push(role.id);
      serverData.save();
      embed(int).setSuccess(`Роль ${role} добавлен.`).send();
      return;
    }

  }
}
