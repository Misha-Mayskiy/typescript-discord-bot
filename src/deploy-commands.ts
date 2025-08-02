import {REST, Routes, SlashCommandBuilder} from 'discord.js';
import {config} from './config';

const commands = [
    new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Показать меню для выбора игровых ролей.'),
].map(command => command.toJSON());

const rest = new REST({version: '10'}).setToken(config.TOKEN!);

(async () => {
    try {
        console.log('Начинаю обновление (/) команд приложения.');

        await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID!, config.GUILD_ID!),
            {body: commands},
        );

        console.log('(/) Команды приложения успешно обновлены.');
    } catch (error) {
        console.error(error);
    }
})();