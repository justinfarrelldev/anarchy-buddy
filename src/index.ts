import { Client, Message } from "discord.js";
import { BOT_COMMAND_NAME, Error } from "./constants";
import { ResolveCommand } from "./commands";

require("dotenv").config();
const Discord = require("discord.js");
const discordClient: Client = new Discord.Client();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}`);
});

discordClient.on("message", (msg: Message) => {
  if (msg.author.bot) return;

  if (!msg.content.startsWith(BOT_COMMAND_NAME)) return;

  const validCommand = ResolveCommand(msg);

  if (!validCommand) Error(msg, "INVALID_COMMAND");
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

export default discordClient;
