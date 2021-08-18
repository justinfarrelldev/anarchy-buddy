import { User, Role } from "discord.js";

export interface Group {
  name: string;
  description: string;
  owner: string;
  guildMembers: User[];
  color?: string;
  server: string;
  privateGroup: boolean;
  role: Role | undefined;
}
