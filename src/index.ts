import {
    Client,
    GatewayIntentBits,
    Events,
    Interaction,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    GuildMemberRoleManager,
    GuildMember
} from 'discord.js';
import {config, GAME_ROLES} from './config';

// Создаем клиента
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Важно для работы с ролями
    ],
});

// Событие готовности бота
client.once(Events.ClientReady, c => {
    console.log(`✅ Готово! Бот ${c.user.tag} запущен.`);
});

// Слушаем взаимодействия (команды и кнопки/меню)
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

    // --- Обработка команды /roles ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'roles') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('game_role_select')
            .setPlaceholder('Выберите игры, в которые вы играете...')
            .setMinValues(0) // Можно не выбирать ничего, чтобы снять все роли
            .setMaxValues(GAME_ROLES.length) // Можно выбрать хоть все роли
            .addOptions(GAME_ROLES.map(role => ({
                label: role.label,
                description: role.description,
                value: role.value, // ID роли
            })));

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        await interaction.reply({
            content: 'Выберите ваши игровые роли из списка ниже.',
            components: [row],
            ephemeral: true, // Сообщение видно только тому, кто вызвал команду
        });
    }

    // --- Обработка выбора в меню ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'game_role_select') {
        const member = interaction.member as GuildMember;
        const selectedRoleIds = interaction.values; // Массив ID ролей, которые выбрал пользователь

        // Получаем все ID игровых ролей, которые есть в нашей системе
        const allGameRoleIds = GAME_ROLES.map(r => r.value);

        // Получаем роли, которые уже есть у пользователя, но только те, что из нашего списка
        const currentMemberRoles = member.roles.cache
            .filter(role => allGameRoleIds.includes(role.id))
            .map(role => role.id);

        // Роли, которые нужно добавить = выбранные - текущие
        const rolesToAdd = selectedRoleIds.filter(id => !currentMemberRoles.includes(id));

        // Роли, которые нужно убрать = текущие - выбранные
        const rolesToRemove = currentMemberRoles.filter(id => !selectedRoleIds.includes(id));

        if (rolesToAdd.length > 0) {
            await member.roles.add(rolesToAdd);
        }
        if (rolesToRemove.length > 0) {
            await member.roles.remove(rolesToRemove);
        }

        await interaction.update({ // Используем update вместо reply
            content: '✅ Ваши роли были успешно обновлены!',
            components: [], // Убираем меню после выбора
        });
    }
});

// Логин бота
client.login(config.TOKEN);