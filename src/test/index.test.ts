import {
  Client,
  Message as DiscordMessage,
  TextChannel,
  Guild,
} from "discord.js";
import { ResolveCommand } from "../commands/index";

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

describe("Bot", () => {
  it("executes the help command", async () => {
    let guild = new Discord.Guild(discordClient, {
      id: Discord.SnowflakeUtil.generate(),
    });
    let user = new Discord.User(discordClient, {
      id: Discord.SnowflakeUtil.generate(),
    });
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
    let message = new DiscordMessage(
      discordClient,
      {
        content: "ab help",
        author: { username: "BiggestBulb", discriminator: 1234 },
        id: "test",
      },
      new Discord.TextChannel(new Guild(discordClient, {}), {
        client: discordClient,
        guild: new Guild(discordClient, {}),
        id: "channel-id",
      })
    );

    const valid = ResolveCommand(message);
    console.log("Valid: ", valid);
    expect(valid).toBe(true);
  });
});
