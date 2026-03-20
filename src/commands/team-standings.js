const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team-standings')
    .setDescription('Show current constructors (team) standings'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getConstructorStandings();
      const standings = data.StandingsTable.StandingsLists?.[0]?.ConstructorStandings || [];
      if (!standings.length) return interaction.editReply('No constructor standings available.');
      const embed = new EmbedBuilder().setTitle(`Constructor Standings — ${data.season}`).setColor('#ff7043');
      for (let s of standings.slice(0, 10)) {
        embed.addFields({ name: `${s.position}. ${s.Constructor.name}`, value: `Points: ${s.points}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch constructor standings.');
    }
  }
};
