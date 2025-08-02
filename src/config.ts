import dotenv from 'dotenv';

dotenv.config();

export const config = {
    TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
};

// IMPORTANT: First create roles on server and copy them IDs (RMB on role)
export const GAME_ROLES = [
    {
        label: 'Counter-Strike 2',
        description: 'Роль для игроков в CS2',
        value: '1401158204523544606',
    },
    {
        label: 'Dota 2',
        description: 'Роль для игроков в Dota 2',
        value: '1401158139826536532',
    },
    {
        label: 'Baldur\'s Gate 3',
        description: 'Роль для искателей приключений в BG3',
        value: '1401158084650471424',
    },
    // Next roles
];