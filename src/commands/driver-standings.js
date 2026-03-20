const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('driver-standings')
    .setDescription('Show current driver standings (WDC)'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getDriverStandings();
      const standings = data.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
      if (!standings.length) return interaction.editReply('No driver standings available.');
      const embed = new EmbedBuilder().setTitle(`Driver Standings — ${data.season}`).setColor('#f44336');
      for (let s of standings.slice(0, 10)) {
        embed.addFields({ name: `${s.position}. ${s.Driver.givenName} ${s.Driver.familyName}`, value: `Points: ${s.points} — ${s.Constructors.map(c=>c.name).join(', ')}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch driver standings.');
    }
  }
};
