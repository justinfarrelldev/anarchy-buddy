import { Client, Message } from "discord.js";
import { BOT_COMMAND_NAME, Error } from "./constants";
import { ResolveCommand } from "./commands";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

require("dotenv").config();
const Discord = require("discord.js");
const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION_BOT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_BOT,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BOT,
});

const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
const discordClient: Client = new Discord.Client();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}`);
});

discordClient.on("message", (msg: Message) => {
  // if (msg.content == "test_db") {
  //   const params: DocumentClient.PutItemInput = {
  //     TableName: "anarchy-buddy-teams",
  //     Item: {
  //       id: Date.now(),
  //       info: {
  //         name: "I am a test",
  //         description: "Just a dynamo db test",
  //       },
  //     },
  //   };

  //   docClient.put(params, (error) => {
  //     if (!error) {
  //       return msg.member.send("Success");
  //     } else {
  //       throw "Unable to save record, err" + error;
  //     }
  //   });
  // }

  if (msg.author.bot) return;

  if (!msg.content.startsWith(BOT_COMMAND_NAME)) return;

  const validCommand = ResolveCommand(msg);

  if (!validCommand) Error(msg, "INVALID_COMMAND");
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

export default discordClient;
