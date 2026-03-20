const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teams')
    .setDescription('List the teams (constructors) for the current season'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await api.getConstructors();
      const constructors = data.ConstructorTable.Constructors || [];
      const embed = new EmbedBuilder().setTitle(`Constructors — ${data.season}`).setColor('#1976d2');
      for (let c of constructors) {
        embed.addFields({ name: c.name, value: `Nationality: ${c.nationality} — ID: ${c.constructorId}` });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to fetch constructors.');
    }
  }
};
