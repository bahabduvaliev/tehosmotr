// Показывает id чатов, куда бот может писать. Сначала добавьте бота в группу и напишите там любое сообщение.
// Запуск: TELEGRAM_BOT_TOKEN=123:ABC npm run tg:chat-id
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error('Укажите TELEGRAM_BOT_TOKEN'); process.exit(1); }
const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await res.json();
if (!data.ok) { console.error('Telegram ответил ошибкой:', data.description); process.exit(1); }
const chats = new Map();
for (const u of data.result) {
  const c = (u.message ?? u.channel_post ?? u.my_chat_member)?.chat;
  if (c) chats.set(c.id, c.title ?? [c.first_name, c.last_name].filter(Boolean).join(' '));
}
if (!chats.size) console.log('Сообщений нет. Напишите что-нибудь боту или в группу с ботом и запустите ещё раз.');
for (const [id, name] of chats) console.log(`${id}\t${name}`);
