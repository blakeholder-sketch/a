const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('favorite')
    .setDescription('Set or view your favorite driver')
    .addSubcommand(sc => sc.setName('set').setDescription('Set your favorite driver').addStringOption(o => o.setName('query').setDescription('Driver name or id').setRequired(true)))
    .addSubcommand(sc => sc.setName('get').setDescription('Get your favorite driver'))
    .addSubcommand(sc => sc.setName('clear').setDescription('Clear your favorite driver')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply();
    try {
      const userId = interaction.user.id;
      if (sub === 'set') {
        const q = interaction.options.getString('query');
        // resolve driver
        let driver = null;
        try { const d = await api.getDriverById(q); driver = d.DriverTable.Drivers?.[0] || null; } catch(e){}
        if (!driver) {
          const list = await api.searchDriversByName(q);
          driver = list[0] || null;
        }
        if (!driver) return interaction.editReply('Driver not found.');
        await db.setFavorite(userId, driver.driverId, `${driver.givenName} ${driver.familyName}`);
        return interaction.editReply(`Saved favorite driver: ${driver.givenName} ${driver.familyName}`);
      } else if (sub === 'get') {
        const f = await db.getFavorite(userId);
        if (!f) return interaction.editReply('You have not set a favorite driver. Use `/favorite set <name>`');
        const embed = new EmbedBuilder().setTitle(`${f.name} — Favorite Driver`).setDescription(`Driver ID: ${f.driverId}`).setColor('#c2185b');
        return interaction.editReply({ embeds: [embed] });
      } else if (sub === 'clear') {
        await db.clearFavorite(userId);
        return interaction.editReply('Favorite driver cleared.');
      }
      await interaction.editReply('Unknown subcommand.');
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to manage favorite driver.');
    }
  }
};
