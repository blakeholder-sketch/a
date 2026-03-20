const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const api = require('../utils/api');
const { shortAmount } = require('../utils/format');
const { renderDriverCard } = require('../utils/card');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('driver-card')
    .setDescription('Show a short driver card with stats (searches by name or driverId)')
    .addStringOption(opt => opt.setName('query').setDescription('Driver name or id').setRequired(true)),
  async execute(interaction) {
    const q = interaction.options.getString('query');
    await interaction.deferReply();
    try {
      // try direct id first
      let driver = null;
      try {
        const d = await api.getDriverById(q);
        driver = d.DriverTable.Drivers?.[0] || null;
      } catch (e) {
        // ignore
      }
      let alternatives = [];
      if (!driver) {
        const list = await api.searchDriversByName(q);
        if (list.length === 0) return interaction.editReply('Driver not found. Try full name or driver id.');
        if (list.length === 1) {
          driver = list[0];
        } else {
          // present select menu for disambiguation
          const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
          const options = list.slice(0, 10).map(d => ({ label: `${d.givenName} ${d.familyName}`, description: d.driverId, value: d.driverId }));
          const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('driver_card_select').setPlaceholder('Select a driver').addOptions(options)
          );
          return interaction.editReply({ content: 'Multiple drivers found. Please select one:', components: [row] });
        }
        alternatives = list.slice(0, 5).map(d => `${d.givenName} ${d.familyName} (${d.driverId})`);
      }
      if (!driver) return interaction.editReply('Driver not found.');

      // Mock economy: try to fetch points
      let market = 5_000_000;
      let pointsField = null;
      try {
        const standingData = await api.getDriverStandings();
        const standings = standingData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
        const found = standings.find(s => s.Driver.driverId === driver.driverId);
        if (found) {
          market = Math.min(120_000_000, 1_000_000 + Number(found.points) * 1_000_000 / 10);
          pointsField = `${found.points} pts (P${found.position})`;
        }
      } catch (e) {
        // ignore
      }

      const marketStr = `$${shortAmount(market)}`;

      // Generate image
      const img = await renderDriverCard({
        name: `${driver.givenName} ${driver.familyName}`,
        code: driver.code || driver.driverId || '',
        nationality: driver.nationality || '',
        dateOfBirth: driver.dateOfBirth || '',
        market: marketStr,
      });

      const attachment = new AttachmentBuilder(img, { name: 'driver-card.png' });

      const embed = new EmbedBuilder()
        .setTitle(`${driver.givenName} ${driver.familyName}`)
        .setDescription(`${driver.code || '—'} • ${driver.nationality || '—'}`)
        .setColor('#009688')
        .setImage('attachment://driver-card.png')
        .addFields(
          { name: 'Driver ID', value: driver.driverId || '—', inline: true },
          { name: 'DOB', value: driver.dateOfBirth || '—', inline: true }
        );

      if (pointsField) embed.addFields({ name: 'Points (this season)', value: pointsField, inline: true });
      embed.addFields({ name: 'Market Value (mock)', value: marketStr, inline: true });

      if (alternatives.length > 1) {
        embed.addFields({ name: 'Alternatives (first 5)', value: alternatives.join('\n') });
      }

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Failed to build driver card.');
    }
  }
};

// handle select menu interaction
module.exports.handleSelect = async function(interaction) {
  try {
    await interaction.deferUpdate();
    const selected = interaction.values?.[0];
    if (!selected) return interaction.followUp({ content: 'No selection.', ephemeral: true });
    // fetch driver by id
    const d = await api.getDriverById(selected);
    const driver = d.DriverTable.Drivers?.[0];
    if (!driver) return interaction.followUp({ content: 'Driver not found.', ephemeral: true });

    // compute market and points
    let market = 5_000_000;
    let pointsField = null;
    try {
      const standingData = await api.getDriverStandings();
      const standings = standingData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
      const found = standings.find(s => s.Driver.driverId === driver.driverId);
      if (found) {
        market = Math.min(120_000_000, 1_000_000 + Number(found.points) * 1_000_000 / 10);
        pointsField = `${found.points} pts (P${found.position})`;
      }
    } catch (e) {}
    const marketStr = `$${shortAmount(market)}`;
    const img = await renderDriverCard({
      name: `${driver.givenName} ${driver.familyName}`,
      code: driver.code || driver.driverId || '',
      nationality: driver.nationality || '',
      dateOfBirth: driver.dateOfBirth || '',
      market: marketStr,
    });
    const attachment = new (require('discord.js').AttachmentBuilder)(img, { name: 'driver-card.png' });
    const embed = new EmbedBuilder()
      .setTitle(`${driver.givenName} ${driver.familyName}`)
      .setDescription(`${driver.code || '—'} • ${driver.nationality || '—'}`)
      .setColor('#009688')
      .setImage('attachment://driver-card.png')
      .addFields(
        { name: 'Driver ID', value: driver.driverId || '—', inline: true },
        { name: 'DOB', value: driver.dateOfBirth || '—', inline: true }
      );
    if (pointsField) embed.addFields({ name: 'Points (this season)', value: pointsField, inline: true });
    embed.addFields({ name: 'Market Value (mock)', value: marketStr, inline: true });
    await interaction.followUp({ embeds: [embed], files: [attachment] });
  } catch (e) {
    console.error('Select handler error', e);
    if (!interaction.replied) await interaction.reply({ content: 'Error generating driver card.', ephemeral: true });
  }
};
