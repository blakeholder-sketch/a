const { SlashCommandBuilder } = require('discord.js');
const { sendImmediateReminders } = require('../scheduler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder-test')
    .setDescription('Trigger reminder test: send immediate reminders to this channel or to your DM')
    .addStringOption(opt => opt.setName('target').setDescription('Where to send the test reminders').addChoices(
      { name: 'channel', value: 'channel' },
      { name: 'dm', value: 'dm' }
    ).setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getString('target');
    await interaction.deferReply({ ephemeral: true });
    try {
      if (target === 'channel') {
        await sendImmediateReminders(interaction.client, { channelId: interaction.channelId });
        return interaction.editReply('Sent test reminders to this channel.');
      } else {
        await sendImmediateReminders(interaction.client, { userId: interaction.user.id });
        return interaction.editReply('Sent test reminders to your DM (if bot can DM you).');
      }
    } catch (e) {
      console.error(e);
      return interaction.editReply('Failed to send test reminders.');
    }
  }
};
