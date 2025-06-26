import {SlashCommandBuilder} from "discord.js";

export const roleCmd = new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role for someone")
    .addSubcommand((s) =>
        s
            .setName("add")
            .setDescription("Give a role")
            .addUserOption((o) =>
                o.setName("user").setDescription("User").setRequired(true)
            )
            .addRoleOption((o) =>
                o.setName("role").setDescription("Role").setRequired(true)
            )
    )
    .addSubcommand((s) =>
        s
            .setName("remove")
            .setDescription("Remove a role")
            .addUserOption((o) =>
                o.setName("user").setDescription("User").setRequired(true)
            )
            .addRoleOption((o) =>
                o.setName("role").setDescription("Role").setRequired(true)
            )
    )
    .toJSON();