# Game Roles Bot

A friendly and powerful Discord bot that allows server members to self-assign game-specific roles using a clean, interactive menu.

---

## How to Add Me to Your Server

It's simple! Just click the link below and choose the server you want to add me to.

**[➡️ Add Bot to Your Server](https://discord.com/oauth2/authorize?client_id=1387783412709855262)**

You will need "Administrator" or "Manage Server" permissions on the server to add the bot.

---

## Key Features

-   **Easy Self-Service Roles:** No more asking admins! Users can pick their roles from a simple dropdown menu.
-   **Multi-Server Support:** Fully functional on any server. Each server's configuration is unique and independent.
-   **Simple Admin Commands:** Intuitive slash commands for server admins to set up and manage the available roles.
-   **Secure and Persistent:** Uses a database to remember your server's settings.

## How to Use

### For Administrators

1.  **Add Roles:** Use the `/role-add` command to add a role to the selection menu.
    -   *Example: `/role-add role:@CS2 description:For fans of tactical shooters`*

2.  **Remove Roles:** Use `/role-remove` to take a role off the menu.
    -   *Example: `/role-remove role:@Valorant`*

3.  **Post the Menu:** Go to your desired channel (e.g., `#get-roles`) and use the `/roles-post` command. The bot will post the interactive menu there.

### For Server Members

Simply find the message posted by the bot, click the dropdown menu, and select the games you play! The bot will automatically update your roles.

### ⚠️ Important: Role Hierarchy

For me to assign roles, my own role (`Sans` or `Game Roles Bot`) must be positioned **higher** in your server's role list than the roles I need to manage.

*Go to `Server Settings → Roles` and drag my role above the game roles.*