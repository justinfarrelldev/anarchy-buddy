const Discord = require("discord.js");
const ERRORS = require("../../build/constants").ERRORS;
require("dotenv").config();

const client = new Discord.Client();

const ping = async (message, args) => {
  message.channel.send("Invalid command.");
};

// a counter so that all the ids are unique
let count = 0;

class Guild extends Discord.Guild {
  constructor(client) {
    super(client, {
      id: (count++).toString(),
      name: "",
      icon: null,
      splash: null,
      owner_id: "",
      region: "",
      afk_channel_id: null,
      afk_timeout: 0,
      verification_level: 0,
      default_message_notifications: 0,
      explicit_content_filter: 0,
      roles: [],
      emojis: [],
      features: [],
      mfa_level: 0,
      application_id: null,
      system_channel_flags: 0,
      system_channel_id: null,
      widget_enabled: false,
      widget_channel_id: null,
    });
    this.client.guilds.cache.set(this.id, this);
  }
}

class TextChannel extends Discord.TextChannel {
  constructor(guild) {
    super(guild, {
      id: count++,
      type: 0,
    });
    this.client.channels.cache.set(this.id, this);
  }

  send(content) {
    return this.client.actions.MessageCreate.handle({
      id: (count++).toString(),
      type: 0,
      channel_id: this.id,
      content,
      author: {
        id: "bot id",
        username: "bot username",
        discriminator: "1234",
        bot: true,
      },
      pinned: false,
      tts: false,
      nonce: "",
      embeds: [],
      attachments: [],
      timestamp: Date.now(),
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      mention_everyone: false,
    });
  }
}

class Message extends Discord.Message {
  constructor(content, channel, author) {
    super(
      channel.client,
      {
        id: (count++).toString(),
        type: 0,
        channel_id: channel.id,
        content,
        author,
        pinned: false,
        tts: false,
        nonce: "",
        embeds: [],
        attachments: [],
        timestamp: Date.now(),
        edited_timestamp: null,
        mentions: [],
        mention_roles: [],
        mention_everyone: false,
      },
      channel
    );
  }
}

const guild = new Guild(client);
const channel = new TextChannel(guild);

const user = { id: count++, username: "username", discriminator: "1234" };

describe("Commands", () => {
  it("says invalid command when only ab is entered", async () => {
    await ping(new Message("ab", channel, user), []);
    expect(channel.lastMessage.content).toBe(ERRORS.INVALID_COMMAND);
  });
});

describe("Environment variables", () => {
  it("loads them", async () => {
    expect(process.env.AWS_DEFAULT_REGION_BOT).not.toBe("");
    expect(process.env.AWS_ACCESS_KEY_ID_BOT).not.toBe("");
    expect(process.env.AWS_SECRET_ACCESS_KEY_BOT).not.toBe("");
  });
});
