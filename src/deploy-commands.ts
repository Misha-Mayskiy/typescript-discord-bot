import {REST, Routes, SlashCommandBuilder, PermissionFlagsBits} from 'discord.js';
import {config} from './config';

const commands = [
    // Команда для добавления роли
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

    // Команда для удаления роли
    new SlashCommandBuilder()
        .setName('role-remove')
        .setDescription('Удалить игровую роль из меню выбора.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Роль, которую нужно удалить')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // Команда для публикации меню
    new SlashCommandBuilder()
        .setName('roles-post')
        .setDescription('Опубликовать или обновить сообщение с меню выбора ролей в этом канале.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // Команда для синхронизации ролей (добавление новых) группой
    new SlashCommandBuilder()
        .setName('roles-sync')
        .setDescription('Добавить несколько доступных ролей сервера в систему бота за раз.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // Команда для удаления ролей группой
    new SlashCommandBuilder()
        .setName('roles-bulk-remove')
        .setDescription('Удалить несколько ролей из системы бота за раз.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
].map(command => command.toJSON());

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