// ! Deactivated to get CI running. The DiscordJS stuff was causing issues with Jest I couldn't figure out.
// Hopefully I can revisit this in the future to figure out a proper solution

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

jest.useFakeTimers()

const Discord = require("discord.js");
require("dotenv").config();

let discordClient, guild, user, failMessage, passMessageGroup;

const mockDynamoDbPut = jest.fn().mockImplementation(() => {
  return {
    promise() {
      return Promise.resolve({});
    },
  };
});

jest.doMock("aws-sdk", () => {
  return {
    DynamoDB: jest.fn(() => ({
      DocumentClient: jest.fn(() => ({
        put: mockDynamoDbPut,
      })),
    })),
  };
});

const setupDiscordJS = () => {
  discordClient = new Discord.Client();

  guild = new Discord.Guild(discordClient, {
    id: Discord.SnowflakeUtil.generate(),
  });
  user = new Discord.User(discordClient, {
    id: Discord.SnowflakeUtil.generate(),
  });
  failMessage = new DiscordMessage(
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

  passMessageGroup = new DiscordMessage(
    discordClient,
    {
      content: `${BOT_COMMAND_NAME} ${
        Object.keys(COMMAND_LIST)[CREATE_PREDICATE]
      } group`,
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
    let res = await Create(failMessage, {
      predicate: CREATE_PREDICATE,
      args: [],
    } as Command);
    expect(res).toBe(false);
  });
});

describe("Create Command", () => {
  it("returns true when the 'group' argument is supplied", async () => {
    setupDiscordJS();
    let res = await Create(passMessageGroup, {
      predicate: CREATE_PREDICATE,
      args: ["group"],
    } as Command);

    expect(res).toBe(true);
  });
});
