# Multi-Server Game Role Discord Bot

A dynamic, multiserver Discord bot built with TypeScript and `discord.js` that allows server members to self-assign game-specific roles using an interactive select menu.

## Features

-   **Multi-Server Support:** Works on any server it's invited to. Each server's configuration is stored separately.
-   **Dynamic Role Management:** Server administrators can add or remove roles from the selection menu using simple slash commands.
-   **Database Integration:** Uses `better-sqlite3` to store server-specific role configurations, ensuring data persistence and scalability.
-   **Interactive UI:** Users can select multiple game roles from a clean, user-friendly dropdown menu.
-   **Permission-Based Commands:** Administrator commands are protected and can only be used by members with "Manage Roles" permissions.
-   **Robust Error Handling:** The bot handles common errors, like missing permissions, without crashing and informs the user about the issue.

## Setup and Installation

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16.9.0 or higher)
-   A Discord Bot Application with a Token. You can create one on the [Discord Developer Portal](https://discord.com/developers/applications).

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Misha-Mayskiy/typescript-discord-bot.git
    cd typescript-discord-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your environment variables:**
    Create a file named `.env` in the root of the project and add the following content:
    ```env
    # Your bot's token from the Discord Developer Portal
    DISCORD_TOKEN=YourBotTokenHere

    # Your bot's client ID from the 'OAuth2' page in the Developer Portal
    CLIENT_ID=YourClientIDHere
    ```

## Running the Bot

The bot requires a two-step process to run: first, you deploy the slash commands to Discord, and then you start the bot application.

1.  **Deploy Slash Commands:**
    Run this command **once** whenever you change or add new commands.
    ```bash
    npx ts-node src/deploy-commands.ts
    ```
    *Note: Global commands can take up to an hour to update across all servers.*

2.  **Start the Bot:**
    To run the bot and have it automatically restart on file changes (recommended for development):
    ```bash
    npm run dev
    ```
    To build the project and run the compiled JavaScript code (for production):
    ```bash
    npm run build
    npm run start
    ```

## Usage

### For Administrators

Administrators (members with the "Manage Roles" permission) can configure the bot using the following slash commands:

-   `/role-add <role> [description]`
    Adds a role to the selection menu for this server. The `description` is optional and will be shown in the menu.
    *Example: `/role-add role:@CS2 description:For fans of tactical shooters`*

-   `/role-remove <role>`
    Removes a role from the selection menu.
    *Example: `/role-remove role:@CS2`*

-   `/roles-post`
    Posts the interactive role selection menu in the current channel. Users will interact with this message to get their roles.

### For Server Members

1.  Find the message posted by the bot (usually in a `#roles` or `#get-roles` channel).
2.  Click on the dropdown select menu.
3.  Check all the roles you want to have.
4.  Click away. The bot will automatically update your roles and send you a confirmation message that only you can see.

### ⚠️ Important: Role Hierarchy

For the bot to be able to assign roles, its own role must be positioned **higher** in the server's role list than the roles it needs to manage.

**Go to Server Settings → Roles and drag the bot's role above all the game roles.**

```
CORRECT:
- MyBot's Role
- CS2 Role
- Dota 2 Role

INCORRECT:
- CS2 Role
- MyBot's Role  <-- (Will cause a "Missing Permissions" error)
- Dota 2 Role
```