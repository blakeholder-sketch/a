const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qualifying')
    .setDescription('Show qualifying results for the most recent race'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getLastQualifyingResults();
      const race = data.RaceTable.Races?.[0];
      if (!race) return interaction.editReply('No recent qualifying results found.');
      const results = race.QualifyingResults || [];
      const embed = new EmbedBuilder().setTitle(`${race.raceName} — Qualifying`).setDescription(`${race.Circuit.circuitName} — ${race.date}`).setColor('#0d47a1');
      for (let r of results.slice(0, 10)) {
        const driver = `${r.Driver.givenName} ${r.Driver.familyName}`;
        embed.addFields({ name: `${r.position}. ${driver}`, value: `Q1: ${r.Q1 || '—'} | Q2: ${r.Q2 || '—'} | Q3: ${r.Q3 || '—'}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch qualifying results.');
    }
  }
};
