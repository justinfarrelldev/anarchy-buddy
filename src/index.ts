import { Message } from "discord.js";
import { BOT_COMMAND_NAME, ERRORS } from "../constants";
import { ResolveCommand } from "./commands";

require("dotenv").config();
const Discord = require("discord.js");
const discordClient = new Discord.Client();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}`);
});

discordClient.on("message", (msg: Message) => {
  if (msg.author.bot) return;

  if (!msg.content.startsWith(BOT_COMMAND_NAME)) return;

  const tokens = msg.content.split(" ");

  const validCommand = ResolveCommand(
    msg
  );

  if (!validCommand) msg.channel.send(ERRORS.INVALID_COMMAND);
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

export default discordClient;
