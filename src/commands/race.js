const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');
const { formatDateTime } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('race')
    .setDescription('Show information about the next race'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getNextRace();
      const races = data.RaceTable.Races || [];
      if (races.length === 0) return interaction.editReply('No upcoming race found.');
      const r = races[0];
      const embed = new EmbedBuilder()
        .setTitle(`${r.raceName} — Round ${r.round}`)
        .setDescription(`${r.Circuit.circuitName} — ${r.Circuit.Location.locality}, ${r.Circuit.Location.country}`)
        .addFields(
          { name: 'Date', value: `${r.date}${r.time ? ' ' + formatDateTime(r.date + 'T' + r.time) : ''}` },
          { name: 'URL', value: r.url || 'N/A' }
        )
        .setColor('#d32f2f');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch next race.');
    }
  }
};
