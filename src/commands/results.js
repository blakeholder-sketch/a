const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Show results for the most recent race'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getLastRaceResults();
      const race = data.RaceTable.Races?.[0];
      if (!race) return interaction.editReply('No recent race results found.');
      const results = race.Results || [];
      const embed = new EmbedBuilder().setTitle(`${race.raceName} — Results`).setDescription(`${race.Circuit.circuitName} — ${race.date}`).setColor('#212121');
      for (let r of results.slice(0, 10)) {
        const driver = `${r.Driver.givenName} ${r.Driver.familyName}`;
        embed.addFields({ name: `${r.position}. ${driver}`, value: `Constructor: ${r.Constructor.name} — Time: ${r.Time?.time || r.status || '—'} — Laps: ${r.laps}`, inline: false });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch last race results.');
    }
  }
};
