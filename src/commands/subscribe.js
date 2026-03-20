const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Manage race reminders for this guild/channel or your DMs')
    .addSubcommand(sc => sc.setName('channel').setDescription('Subscribe this channel to race reminders'))
    .addSubcommand(sc => sc.setName('unsubscribe').setDescription('Unsubscribe this channel from race reminders'))
    .addSubcommand(sc => sc.setName('dm').setDescription('Subscribe yourself to DM race reminders'))
    .addSubcommand(sc => sc.setName('dm-unsubscribe').setDescription('Unsubscribe yourself from DM race reminders'))
    .addSubcommand(sc => sc.setName('list').setDescription('List subscriptions for this guild')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    try {
      if (sub === 'channel') {
        await db.addSubscription({ guildId, channelId, userId: null, type: 'race' });
        return interaction.reply({ content: 'This channel has been subscribed to race reminders.', ephemeral: true });
      }
      if (sub === 'unsubscribe') {
        const removed = await db.removeSubscription({ guildId, channelId, userId: null, type: 'race' });
        if (removed) return interaction.reply({ content: 'This channel has been unsubscribed.', ephemeral: true });
        return interaction.reply({ content: 'No subscription found for this channel.', ephemeral: true });
      }
      if (sub === 'dm') {
        await db.addSubscription({ guildId: null, channelId: null, userId: interaction.user.id, type: 'race' });
        return interaction.reply({ content: 'You are subscribed to DM race reminders.', ephemeral: true });
      }
      if (sub === 'dm-unsubscribe') {
        const removed = await db.removeSubscription({ guildId: null, channelId: null, userId: interaction.user.id, type: 'race' });
        if (removed) return interaction.reply({ content: 'You have been unsubscribed from DM reminders.', ephemeral: true });
        return interaction.reply({ content: 'You were not subscribed to DM reminders.', ephemeral: true });
      }
      if (sub === 'list') {
        const subs = await db.listSubscriptions(guildId);
        if (!subs.length) return interaction.reply({ content: 'No subscriptions for this guild.', ephemeral: true });
        const lines = subs.map(s => `#${s.id} channel:${s.channelId} user:${s.userId || '-'} type:${s.type}`);
        return interaction.reply({ content: lines.join('\n'), ephemeral: true });
      }
      return interaction.reply({ content: 'Unknown subcommand', ephemeral: true });
    } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'Failed to manage subscription.', ephemeral: true });
    }
  }
};
