import {REST, Routes} from "discord.js";
import {config} from "dotenv";
import {roleCmd} from "./commands/role.js";

config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log("⌛ Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            {body: [roleCmd]}
        );
        console.log("✅ Commands registered.");
    } catch (err) {
        console.error(err);
    }
})();