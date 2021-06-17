import {
  Client,
  Message as DiscordMessage,
  TextChannel,
  Guild,
} from "discord.js";
import { Create, CREATE_PREDICATE } from ".";
import { COMMAND_LIST } from "..";
import { BOT_COMMAND_NAME } from "../../constants";
import { Command } from "../../command";

const Discord = require("discord.js");
require("dotenv").config();

let discordClient, guild, user, message;

const setupDiscordJS = () => {
  discordClient = new Discord.Client();

  guild = new Discord.Guild(discordClient, {
    id: Discord.SnowflakeUtil.generate(),
  });
  user = new Discord.User(discordClient, {
    id: Discord.SnowflakeUtil.generate(),
  });
  message = new DiscordMessage(
    discordClient,
    {
      content: `${BOT_COMMAND_NAME} ${
        Object.keys(COMMAND_LIST)[CREATE_PREDICATE]
      }`,
      author: { username: "BiggestBulb", discriminator: 1234 },
      id: "test",
    },
    new Discord.TextChannel(new Guild(discordClient, {}), {
      client: discordClient,
      guild: new Guild(discordClient, {}),
      id: "channel-id",
    })
  );
};

describe("Create Command", () => {
  it("returns false if the command is supplied without args", async () => {
    setupDiscordJS();
    let res = await Create(message, {
      predicate: CREATE_PREDICATE,
      args: [],
    } as Command);
    await discordClient.destroy();
    expect(res).toBe(false);
  });
});
