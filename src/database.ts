import Database from 'better-sqlite3';

// Создаем или подключаемся к файлу bot.db в корне проекта
const db = new Database('bot.db');

// Функция для первоначальной настройки таблиц
export function setupDatabase() {
    // Таблица для хранения игровых ролей для каждого сервера
    // guild_id: ID сервера (гильдии)
    // role_id: ID роли
    // role_name: Имя роли (для удобства)
    // description: Описание для меню
    db.exec(`
        CREATE TABLE IF NOT EXISTS game_roles (
            guild_id TEXT NOT NULL,
            role_id TEXT NOT NULL,
            role_name TEXT NOT NULL,
            description TEXT,
            PRIMARY KEY (guild_id, role_id)
        );
    `);
    console.log('База данных успешно настроена.');
}

export default db;