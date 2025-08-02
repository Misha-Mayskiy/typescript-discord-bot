import {
    Client,
    GatewayIntentBits,
    Events,
    Interaction,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    GuildMember,
    Role,
    MessageFlags,
    ActivityType
} from 'discord.js';
import {config} from './config';
import db, {setupDatabase} from './database';

// Вызываем настройку БД при старте
setupDatabase();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once(Events.ClientReady, c => {
    console.log(`✅ Готово! Бот ${c.user.tag} запущен и готов к работе на ${c.guilds.cache.size} серверах.`);

    // Custom status
    c.user.setActivity({
        name: `on ${c.guilds.cache.size} servers`,
        type: ActivityType.Watching, // Other vars: Playing, Listening, Competing
    });
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.inGuild()) return; // Команды доступны только на серверах

    // --- ОБРАБОТКА КОМАНД АДМИНИСТРАТОРА ---

    if (interaction.isChatInputCommand()) {
        // Команда /role-add
        if (interaction.commandName === 'role-add') {
            const role = interaction.options.getRole('role') as Role;
            const description = interaction.options.getString('description');

            try {
                const stmt = db.prepare('INSERT INTO game_roles (guild_id, role_id, role_name, description) VALUES (?, ?, ?, ?)');
                stmt.run(interaction.guildId, role.id, role.name, description);
                await interaction.reply({
                    content: `Роль **${role.name}** добавлена в меню выбора.`,
                    flags: [MessageFlags.Ephemeral]
                });
            } catch (error: any) {
                if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                    await interaction.reply({
                        content: `Ошибка: роль **${role.name}** уже добавлена.`,
                        flags: [MessageFlags.Ephemeral]
                    });
                } else {
                    await interaction.reply({
                        content: 'Произошла ошибка при добавлении роли.',
                        flags: [MessageFlags.Ephemeral]
                    });
                }
            }
        }

        // Команда /role-remove
        if (interaction.commandName === 'role-remove') {
            const role = interaction.options.getRole('role') as Role;

            const stmt = db.prepare('DELETE FROM game_roles WHERE guild_id = ? AND role_id = ?');
            const result = stmt.run(interaction.guildId, role.id);

            if (result.changes > 0) {
                await interaction.reply({
                    content: `Роль **${role.name}** удалена из списка.`,
                    flags: [MessageFlags.Ephemeral]
                });
            } else {
                await interaction.reply({
                    content: `Ошибка: роль **${role.name}** не найдена в списке.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }

        // Команда /roles-post
        if (interaction.commandName === 'roles-post') {
            const rolesFromDb = db.prepare('SELECT role_id, role_name, description FROM game_roles WHERE guild_id = ?').all(interaction.guildId) as {
                role_id: string,
                role_name: string,
                description: string | null
            }[];

            if (rolesFromDb.length === 0) {
                await interaction.reply({
                    content: 'На этом сервере не настроено ни одной игровой роли. Используйте `/role-add`, чтобы добавить их.',
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('game_role_select')
                .setPlaceholder('Выберите ваши игровые роли...')
                .setMinValues(0)
                .setMaxValues(rolesFromDb.length)
                .addOptions(rolesFromDb.map(role => ({
                    label: role.role_name,
                    description: role.description || `Получить роль ${role.role_name}`,
                    value: role.role_id,
                })));

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            // Отправляем сообщение в текущий канал
            await interaction.channel?.send({
                content: '**Выберите роли по играм**\nНажмите на меню ниже, чтобы добавить или убрать роли.',
                components: [row],
            });

            await interaction.reply({
                content: 'Сообщение с выбором ролей успешно отправлено!',
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.commandName === 'roles-sync') {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            // Получаем все роли, которые бот может назначать (ниже его собственной роли)
            const botMember = interaction.guild!.members.me!;
            const allManageableRoles = interaction.guild!.roles.cache.filter(role =>
                role.position < botMember.roles.highest.position && role.name !== '@everyone'
            );

            // Получаем роли, которые уже есть в БД
            const existingRoles = db.prepare('SELECT role_id FROM game_roles WHERE guild_id = ?').all(interaction.guildId) as {
                role_id: string
            }[];
            const existingRoleIds = new Set(existingRoles.map(r => r.role_id));

            // Находим роли, которых еще нет в системе
            const newRoles = allManageableRoles.filter(role => !existingRoleIds.has(role.id));

            if (newRoles.size === 0) {
                await interaction.editReply('Все доступные роли на сервере уже добавлены в систему.');
                return;
            }

            // Создаем меню выбора. Discord ограничивает 25 опциями на меню.
            const roleOptions = newRoles.map(role => ({
                label: role.name,
                value: role.id
            })).slice(0, 25);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('bulk_add_roles_select')
                .setPlaceholder('Выберите роли для добавления в систему')
                .setMinValues(1)
                .setMaxValues(roleOptions.length)
                .addOptions(roleOptions);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            await interaction.editReply({
                content: `Найдено ${newRoles.size} новых ролей, которые можно добавить. Показаны первые 25. Выберите роли и я добавлю их в систему.`,
                components: [row]
            });
        }

        if (interaction.commandName === 'roles-bulk-remove') {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

            const existingRoles = db.prepare('SELECT role_id, role_name FROM game_roles WHERE guild_id = ?').all(interaction.guildId) as {
                role_id: string,
                role_name: string
            }[];

            if (existingRoles.length === 0) {
                await interaction.editReply('В системе нет настроенных ролей для удаления.');
                return;
            }

            const roleOptions = existingRoles.map(role => ({
                label: role.role_name,
                value: role.role_id
            })).slice(0, 25);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('bulk_remove_roles_select')
                .setPlaceholder('Выберите роли для удаления из системы')
                .setMinValues(1)
                .setMaxValues(roleOptions.length)
                .addOptions(roleOptions);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            await interaction.editReply({
                content: 'Выберите роли, которые вы хотите удалить из системы бота (сами роли на сервере не удалятся).',
                components: [row]
            });
        }
    }

    // --- ОБРАБОТКА ВЫБОРА В МЕНЮ (логика для пользователей) ---

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'game_role_select') {
            await interaction.deferReply({flags: [MessageFlags.Ephemeral]}); // Откладываем ответ, чтобы избежать тайм-аутов

            const member = interaction.member as GuildMember;
            const selectedRoleIds = interaction.values;

            // Получаем ВСЕ возможные игровые роли для ЭТОГО сервера из БД
            const allGameRoleIdsStmt = db.prepare('SELECT role_id FROM game_roles WHERE guild_id = ?');
            const allGameRoleIds = (allGameRoleIdsStmt.all(interaction.guildId) as {
                role_id: string
            }[]).map(r => r.role_id);

            try {
                // Убираем роли, которые есть в общем списке, но не были выбраны сейчас
                const rolesToRemove = allGameRoleIds.filter(id => !selectedRoleIds.includes(id));
                if (rolesToRemove.length > 0) {
                    await member.roles.remove(rolesToRemove);
                }

                // Добавляем новые выбранные роли
                if (selectedRoleIds.length > 0) {
                    await member.roles.add(selectedRoleIds);
                }

                await interaction.editReply({ // Используем editReply, так как сделали deferReply
                    content: '✅ Ваши роли обновлены!',
                });

            } catch (error: any) {
                console.error('Произошла ошибка при обновлении ролей:', error); // Логируем ошибку для себя

                // Проверяем, что это ошибка прав
                if (error.code === 50013) {
                    await interaction.editReply({
                        content: '❌ **Произошла ошибка!**\nПохоже, у меня недостаточно прав для управления ролями. Пожалуйста, попросите администратора сервера проверить, что моя роль в списке находится **выше** игровых ролей, которыми я управляю.',
                    });
                } else {
                    await interaction.editReply({
                        content: '❌ Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз позже.',
                    });
                }
            }
        } else if (interaction.customId === 'bulk_add_roles_select') {
            await interaction.deferUpdate();

            try {
                const selectedRoleIds = interaction.values;
                const insert = db.prepare('INSERT OR IGNORE INTO game_roles (guild_id, role_id, role_name) VALUES (?, ?, ?)');
                const addMany = db.transaction((roles) => {
                    for (const role of roles) insert.run(interaction.guildId, role.id, role.name);
                });

                const rolesToAdd = interaction.guild!.roles.cache.filter(role => selectedRoleIds.includes(role.id));
                addMany(rolesToAdd.map(role => ({ id: role.id, name: role.name })));

                await interaction.editReply({
                    content: `✅ Успешно добавлено ${selectedRoleIds.length} ролей в систему! Теперь вы можете обновить сообщение с ролями через \`/roles-post\`.`,
                    components: []
                });

            } catch (error) {
                console.error('Ошибка при массовом добавлении ролей:', error);
                await interaction.editReply({
                    content: '❌ Произошла ошибка при добавлении ролей в базу данных. Пожалуйста, проверьте консоль.',
                    components: []
                });
            }

        } else if (interaction.customId === 'bulk_remove_roles_select') {
            await interaction.deferUpdate();

            try {
                const selectedRoleIds = interaction.values;
                const del = db.prepare('DELETE FROM game_roles WHERE guild_id = ? AND role_id = ?');
                const deleteMany = db.transaction((ids) => {
                    for (const id of ids) del.run(interaction.guildId, id);
                });
                deleteMany(selectedRoleIds);

                await interaction.editReply({
                    content: `✅ Успешно удалено ${selectedRoleIds.length} ролей из системы.`,
                    components: []
                });
            } catch (error) {
                console.error('Ошибка при массовом удалении ролей:', error);
                await interaction.editReply({
                    content: '❌ Произошла ошибка при удалении ролей из базы данных. Пожалуйста, проверьте консоль.',
                    components: []
                });
            }
        }
    }
});

client.login(config.TOKEN);