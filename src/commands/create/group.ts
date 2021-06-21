import { User } from "discord.js";

export interface Group {
  name: string;
  description: string;
  owner: string;
  guildMembers: User[];
  color?: string;
  server: string;
  privateGroup: boolean;
}
