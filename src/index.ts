import { Client, Message } from "discord.js";
import { BOT_COMMAND_NAME, LogUserError } from "./constants";
import { ResolveCommand } from "./commands";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

require("dotenv").config();
import Discord = require("discord.js");
import AWS = require("aws-sdk");
import { UserList } from "./user";

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION_BOT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_BOT,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BOT,
});

export const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
export const userList: UserList = new UserList();
const discordClient: Client = new Discord.Client();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}`);
});

discordClient.on("message", async (msg: Message) => {
  if (msg.author.bot) return;

  if (!msg.content.startsWith(BOT_COMMAND_NAME)) return;

  const validCommand = await ResolveCommand(msg);

  if (!validCommand) LogUserError(msg, "INVALID_COMMAND");
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

export default discordClient;
