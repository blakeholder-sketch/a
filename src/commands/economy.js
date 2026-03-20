const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');
const { shortAmount } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Show a lightweight economy view (mock budgets derived from points)'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getConstructorStandings();
      const standings = data.StandingsTable.StandingsLists?.[0]?.ConstructorStandings || [];
      if (!standings.length) return interaction.editReply('No constructor standings available for economy.');

      // Mock budgets: proportional to points, base budget 100M
      const totalPoints = standings.reduce((s, x) => s + Number(x.points), 0) || 1;
      const embed = new EmbedBuilder().setTitle(`F1 Economy (Mock) — ${data.season}`).setColor('#4caf50');
      for (let s of standings.slice(0, 10)) {
        const budget = Math.round((Number(s.points) / totalPoints) * 400_000_000) + 50_000_000; // between ~50M and larger
        embed.addFields({ name: s.Constructor.name, value: `Points: ${s.points} — Budget: $${shortAmount(budget)}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to compute economy.');
    }
  }
};
