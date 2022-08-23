import { Command } from "../../structures/Command";

export default new Command({
    name: "ping",
    description: "replies with pong",
    run: async ({ interaction }) => {
        interaction.followUp("Pong3");
    },
    module: 'information',
    dm: true,
    cooldown: 5
});
