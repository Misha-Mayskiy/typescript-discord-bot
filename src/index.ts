import {Client, GatewayIntentBits} from "discord.js";
import {config} from "dotenv";

config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
    console.log(`🤖 Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction: any) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "role") return;

    const sub = interaction.options.getSubcommand();          // add | remove
    const member = interaction.options.getMember("user", true);
    const role = interaction.options.getRole("role", true);

    if (!interaction.guild) {
        return interaction.reply({content: "Guild only.", ephemeral: true});
    }

    // Permission / hierarchy guard
    const botMember = await interaction.guild.members.fetchMe();
    if (
        role.position >= botMember.roles.highest.position ||
        member.roles.highest.position >= botMember.roles.highest.position
    ) {
        return interaction.reply({
            content: "I’m not high enough in the role hierarchy!",
            ephemeral: true,
        });
    }

    try {
        if (sub === "add") {
            await member.roles.add(role);
            await interaction.reply({content: `✅ Gave ${role} to ${member}.`});
        } else {
            await member.roles.remove(role);
            await interaction.reply({content: `✅ Removed ${role} from ${member}.`});
        }
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "❌ Error editing roles (log has details).",
            ephemeral: true,
        });
    }
});

client.login(process.env.DISCORD_TOKEN).then();