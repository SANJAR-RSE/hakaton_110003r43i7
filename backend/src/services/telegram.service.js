const axios = require('axios');

// Backend pushes notifications directly to Telegram via the Bot API using
// the user's stored telegramChatId - no separate webhook/queue needed for a
// hackathon MVP. If the user never connected the bot, this is a silent no-op.
async function sendTelegramMessage(chatId, text) {
  if (!chatId) return;
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn('[telegram] BOT_TOKEN not set, skipping notification');
    return;
  }
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (err) {
    console.error('[telegram] failed to send message:', err.response?.data || err.message);
  }
}

module.exports = { sendTelegramMessage };
