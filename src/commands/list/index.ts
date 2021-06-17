/*
 * This is the list command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import { docClient } from "../..";
import { BOT_TEAM_DATABASE_NAME } from "../../constants";
import DynamoDB = require("aws-sdk/clients/dynamodb");
const discord = require("discord.js");

export const LIST_PREDICATE = "list";
export const LIST_DESCRIPTION = "Lists various information regarding groups.";
export const LIST_USAGE = "list [group | groups]"; // group and groups both do the same thing, but it would be best to make both list the groups

const listPublicGroups = (msg: Message) => {
  console.log(`${msg.author.username}#${msg.author.discriminator}`);
  docClient
    .scan({
      TableName: BOT_TEAM_DATABASE_NAME,
      FilterExpression: `contains(info.members,:u)`,
      ExpressionAttributeValues: {
        ":u": `${msg.author.username}#${msg.author.discriminator}`,
      },
    })
    .promise()
    .then(
      (result) => {
        result.Items.forEach((item) => {
          console.log(item["info"]["members"]);
          const members = item["info"]["members"]
            ? {
                name: "Members",
                value: item["info"]["members"].join(", "),
              }
            : {};
          let embed = new discord.MessageEmbed()
            .setColor(item["info"]["color"])
            .setTitle(item["info"]["name"])
            .addFields(members, {
              name: "Description",
              value: item["info"]["description"],
            });

          msg.channel.send(embed);
        });
      },
      (rejected) => console.error(rejected)
    )
    .catch((err) => console.error(err));
};

export const List = (msg: Message, command: Command) => {
  if (!command.args[0]) return false;

  switch (command.args[0].toLowerCase()) {
    case "group":
      listPublicGroups(msg);
      return true;
    case "groups":
      listPublicGroups(msg);
      return true;
  }

  return false;
};
