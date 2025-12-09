const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compare-drivers')
    .setDescription('Compare two drivers by current season points')
    .addStringOption(opt => opt.setName('driver1').setDescription('First driver name or id').setRequired(true))
    .addStringOption(opt => opt.setName('driver2').setDescription('Second driver name or id').setRequired(true)),
  async execute(interaction) {
    const d1q = interaction.options.getString('driver1');
    const d2q = interaction.options.getString('driver2');
    await interaction.deferReply();
    try {
      const standingsData = await api.getDriverStandings();
      const standings = standingsData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];

      async function resolveQuery(q) {
        // try id
        let driver = null;
        try { const d = await api.getDriverById(q); driver = d.DriverTable.Drivers?.[0] || null; } catch(e){}
        if (!driver) {
          const list = await api.searchDriversByName(q);
          driver = list[0] || null;
        }
        if (!driver) return null;
        const standing = standings.find(s => s.Driver.driverId === driver.driverId) || null;
        return { driver, standing };
      }

      const r1 = await resolveQuery(d1q);
      const r2 = await resolveQuery(d2q);
      if (!r1 || !r2) return interaction.editReply('Could not resolve one or both drivers. Use full name or driver id.');

      const embed = new EmbedBuilder().setTitle(`Compare: ${r1.driver.givenName} ${r1.driver.familyName} vs ${r2.driver.givenName} ${r2.driver.familyName}`).setColor('#6a1b9a');
      const p1 = r1.standing ? `${r1.standing.points} pts (P${r1.standing.position})` : 'No points data';
      const p2 = r2.standing ? `${r2.standing.points} pts (P${r2.standing.position})` : 'No points data';
      embed.addFields(
        { name: `${r1.driver.givenName} ${r1.driver.familyName}`, value: p1, inline: true },
        { name: `${r2.driver.givenName} ${r2.driver.familyName}`, value: p2, inline: true }
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to compare drivers.');
    }
  }
};
