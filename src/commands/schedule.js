const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');
const { formatDateTime } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Show the current season schedule or next race'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getCurrentSeasonSchedule();
      const races = data.RaceTable.Races || [];
      const embed = new EmbedBuilder().setTitle(`${data.series} ${data.season} Schedule`).setColor('#ff0000');
      for (let r of races.slice(0, 12)) {
        embed.addFields({ name: `${r.round}. ${r.raceName} — ${r.Circuit.circuitName}`, value: `Date: ${r.date}${r.time ? ' ' + formatDateTime(r.date + 'T' + r.time) : ''}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch schedule.');
    }
  }
};
