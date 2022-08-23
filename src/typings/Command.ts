import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    PermissionResolvable
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

/**
 * {
 *  name: "commandname",
 * description: "any description",
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;
interface SpecificCooldown {
    name: string,
    guildOnly: boolean,
    time: number,
    userId: string
};

export type CommandType = {
    permissions?: string[];
    dm?: boolean;
    dev?: boolean,
    cooldown?: number;
    module: 'moderation' | 'information' | 'misc' | 'usefull' | 'fun' | 'tickets' | 'giveaways' | 'economy' | 'levels',
    specificCooldown?: SpecificCooldown;
    run: RunFunction;
} & ChatInputApplicationCommandData;
