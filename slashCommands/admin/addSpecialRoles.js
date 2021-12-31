const { SlashCommandBuilder } = require("@discordjs/builders");

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
  ,
  run: async (client, int, Data) => {
    const { embed, serverData, F, util, db } = Data;

    const guild = int.guild;
    const user = int.user;
    const dataType = int.options.getSubcommand();
    const role = int.options.getRole("роль");
    if (!role) embed(int).setError("Роль не найдена!").send();
    let obj = {
      "модератор": "moderrole",
      "банер": "banAllowedRoles",
      "кикер": "kickAllowedRoles"
    };

    const type = obj[dataType];

    if (!serverData[type]) serverData[type] = [];

    const roleIndexInBase = serverData[type].findIndex(roleId => roleId === role.id);

    if (roleIndexInBase >= 0) {
      serverData[type].splice(roleIndexInBase, 1);
      serverData.save();
      embed(int).setSuccess(`Роль ${role} убрана.`).send();
      return;
    } else {
      serverData[type].push(role.id);
      serverData.save();
      embed(int).setSuccess(`Роль ${role} добавлен.`).send();
      return;
    }

  }
}
