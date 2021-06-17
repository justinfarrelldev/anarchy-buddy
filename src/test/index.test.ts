import {
  Client,
  Message as DiscordMessage,
  TextChannel,
  Guild,
} from "discord.js";
import { COMMAND_LIST, ResolveCommand } from "../commands/index";
import { BOT_COMMAND_NAME } from "../constants";

const Discord = require("discord.js");
require("dotenv").config();

let discordClient = new Discord.Client();

describe("Environment variables", () => {
  it("loads them", async () => {
    expect(process.env.AWS_DEFAULT_REGION_BOT).not.toBe("");
    expect(process.env.AWS_ACCESS_KEY_ID_BOT).not.toBe("");
    expect(process.env.AWS_SECRET_ACCESS_KEY_BOT).not.toBe("");
  });
});

/* 

    let member = new Discord.GuildMember(
      discordClient,
      { id: Discord.SnowflakeUtil.generate(), user: { id: user.id } },
      guild
    );
    let role = new Discord.Role(
      discordClient,
      { id: Discord.SnowflakeUtil.generate() },
      guild
    );

*/

describe("Bot", () => {
  it("sees the commands as valid", async () => {
    let numValidCommands = 0;

    Object.keys(COMMAND_LIST).forEach((command) => {
      let guild = new Discord.Guild(discordClient, {
        id: Discord.SnowflakeUtil.generate(),
      });
      let user = new Discord.User(discordClient, {
        id: Discord.SnowflakeUtil.generate(),
      });
      let message = new DiscordMessage(
        discordClient,
        {
          content: `${BOT_COMMAND_NAME} ${command}`,
          author: { username: "BiggestBulb", discriminator: 1234 },
          id: "test",
        },
        new Discord.TextChannel(new Guild(discordClient, {}), {
          client: discordClient,
          guild: new Guild(discordClient, {}),
          id: "channel-id",
        })
      );

      if (ResolveCommand(message)) numValidCommands++;
    });

    expect(numValidCommands).toBe(Object.keys(COMMAND_LIST).length);
  });
});
