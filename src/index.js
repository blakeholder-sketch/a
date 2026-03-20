require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID; // optional

if (!TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment. See .env.example');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

const commandsForRegistration = [];
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data) {
    client.commands.set(command.data.name, command);
    commandsForRegistration.push(command.data.toJSON());
  }
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    if (DEV_GUILD_ID) {
      console.log('Registering commands to guild', DEV_GUILD_ID);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, DEV_GUILD_ID), { body: commandsForRegistration });
    } else {
      console.log('Registering global commands (may take up to 1 hour)');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsForRegistration });
    }
    console.log('Commands registered.');
  } catch (err) {
    console.error('Failed to register commands', err);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('Command execution error', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
  }
});

// Handle component interactions (select menus) for driver disambiguation
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  try {
    if (interaction.customId === 'driver_card_select') {
      const driverModule = require('./commands/driver-card');
      if (driverModule && typeof driverModule.handleSelect === 'function') {
        await driverModule.handleSelect(interaction);
      } else {
        await interaction.reply({ content: 'Handler not available.', ephemeral: true });
      }
    }
  } catch (e) {
    console.error('Component handling error', e);
    if (!interaction.replied) await interaction.reply({ content: 'Error handling selection.', ephemeral: true });
  }
});

(async () => {
  await registerCommands();
  await client.login(TOKEN);
  // start scheduler after login
  try {
    const { startScheduler } = require('./scheduler');
    startScheduler(client);
    console.log('Scheduler started.');
  } catch (e) {
    console.error('Failed to start scheduler', e);
  }
})();
