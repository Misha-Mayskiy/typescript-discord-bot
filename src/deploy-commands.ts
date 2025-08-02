import {REST, Routes, SlashCommandBuilder, PermissionFlagsBits} from 'discord.js';
import {config} from './config';

const commands = [
    // Команда для администраторов для добавления роли
    new SlashCommandBuilder()
        .setName('role-add')
        .setDescription('Добавить игровую роль в меню выбора.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Роль, которую нужно добавить')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Описание для этой роли в меню')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Только для тех, кто может управлять ролями

    // Команда для администраторов для удаления роли
    new SlashCommandBuilder()
        .setName('role-remove')
        .setDescription('Удалить игровую роль из меню выбора.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Роль, которую нужно удалить')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // Команда для администраторов для публикации меню
    new SlashCommandBuilder()
        .setName('roles-post')
        .setDescription('Опубликовать или обновить сообщение с меню выбора ролей в этом канале.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
];

const rest = new REST({version: '10'}).setToken(config.TOKEN!);

(async () => {
    try {
        console.log('Начинаю обновление глобальных (/) команд приложения.');

        await rest.put(
            Routes.applicationCommands(config.CLIENT_ID!),
            {body: commands},
        );

        console.log('Глобальные (/) команды успешно обновлены.');
    } catch (error) {
        console.error(error);
    }
})();