module.exports = {
  name: "messageCreate",
  enabled: true,
  run: async (client, message) => {
    if (message.content && message?.channel?.id === "933349303441846352") {
      message.react("👍");
      message.react("👎");
    }
  }
}
