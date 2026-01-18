/**
 * Notification Service - Extendable mock notification handlers
 * Supports: console (mock), email, SMS, WhatsApp, push notifications
 */

// Mock handlers - extendable for real implementations
const notificationHandlers = {
  console: async (reminder, user) => {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📬 REMINDER NOTIFICATION (CONSOLE MOCK)');
      console.log('='.repeat(60));
      console.log(`To: ${user.name} (${user.email})`);
      console.log(`Type: ${reminder.type.toUpperCase()}`);
      console.log(`Title: ${reminder.title}`);
      console.log(`Description: ${reminder.description || 'N/A'}`);
      console.log(`Reminder Date: ${reminder.reminderDate.toISOString()}`);
      console.log(`Status: ${reminder.status}`);
      console.log('='.repeat(60) + '\n');
      return { success: true, message: 'Console notification sent' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  email: async (reminder, user) => {
    try {
      console.log(`\n📧 EMAIL: Sending to ${user.email}`);
      console.log(`Subject: ${reminder.title}`);
      console.log(`Body: ${reminder.description}`);
      // TODO: Integrate with Nodemailer or SendGrid
      console.log('(Email integration not yet implemented)\n');
      return { success: true, message: 'Email queued for sending' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  sms: async (reminder, user) => {
    try {
      console.log(`\n📱 SMS: Sending to ${user.phone || 'No phone'}`);
      console.log(`Message: ${reminder.title} - ${reminder.description}`);
      // TODO: Integrate with Twilio or AWS SNS
      console.log('(SMS integration not yet implemented)\n');
      return { success: true, message: 'SMS queued for sending' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  whatsapp: async (reminder, user) => {
    try {
      console.log(`\n💬 WhatsApp: Sending to ${user.phone || 'No phone'}`);
      console.log(`Message: ${reminder.title}\n${reminder.description}`);
      // TODO: Integrate with Twilio WhatsApp or official WhatsApp Business API
      console.log('(WhatsApp integration not yet implemented)\n');
      return { success: true, message: 'WhatsApp message queued' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  push: async (reminder, user) => {
    try {
      console.log(`\n🔔 PUSH: Sending to ${user.email}`);
      console.log(`Title: ${reminder.title}`);
      console.log(`Body: ${reminder.description}`);
      // TODO: Integrate with Firebase Cloud Messaging or OneSignal
      console.log('(Push notification integration not yet implemented)\n');
      return { success: true, message: 'Push notification queued' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

/**
 * Send notification via specified channels
 * @param {Object} reminder - Reminder document
 * @param {Object} user - User document
 * @param {Array} channels - Notification channels to use
 */
const sendNotification = async (reminder, user, channels = ['console']) => {
  const results = [];

  for (const channelName of channels) {
    const handler = notificationHandlers[channelName];
    if (!handler) {
      results.push({
        channel: channelName,
        success: false,
        error: `Handler not found for channel: ${channelName}`
      });
      continue;
    }

    const result = await handler(reminder, user);
    results.push({
      channel: channelName,
      ...result
    });
  }

  return results;
};

/**
 * Trigger reminders due at current time
 * Call this periodically (every hour via cron job in production)
 */
const triggerPendingReminders = async (Reminder, User) => {
  try {
    const now = new Date();
    
    // Find reminders that are pending and reminder time has passed
    const pendingReminders = await Reminder.find({
      status: 'pending',
      reminderDate: { $lte: now }
    }).populate('userId');

    console.log(`\n🔔 Checking ${pendingReminders.length} pending reminders...`);

    for (const reminder of pendingReminders) {
      try {
        const channels = reminder.notificationChannels
          .map(ch => ch.channel);

        const results = await sendNotification(reminder, reminder.userId, channels);

        // Update reminder status and log results
        reminder.status = 'sent';
        reminder.notificationChannels = reminder.notificationChannels.map((ch) => {
          const result = results.find(r => r.channel === ch.channel);
          return {
            ...ch,
            sent: result?.success || false,
            sentAt: result?.success ? new Date() : null,
            error: result?.error || null
          };
        });

        await reminder.save();
        console.log(`✅ Reminder sent: ${reminder.title}`);
      } catch (err) {
        console.error(`❌ Error sending reminder: ${err.message}`);
      }
    }

    return pendingReminders.length;
  } catch (err) {
    console.error('Error in triggerPendingReminders:', err.message);
    return 0;
  }
};

module.exports = {
  notificationHandlers,
  sendNotification,
  triggerPendingReminders
};
