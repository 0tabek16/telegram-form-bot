const fastify = require("fastify")({ logger: true });
const { Telegraf } = require("telegraf");
const { parsed: dotEnvConfig } = require("dotenv").config();

const { BOT_TOKEN, PORT } = dotEnvConfig;

const bot = new Telegraf(BOT_TOKEN);

// Declare a route
fastify.post("/form", async (request, reply) => {
  const { chatId, ...body } = request.body;

  if (!chatId) {
    return reply.status(400).send("`chatId` is required");
  }

  const botMessageText = Object.entries(body).reduce((acc, [key, value]) => {
    return acc + `*${key}:* ${value}\n`;
  }, "");
  await bot.telegram.sendMessage(chatId, botMessageText, {
    parse_mode: "Markdown",
  });

  return "OK";
});

bot.start((ctx) =>
  ctx.reply(
    `Welcome to Telegram Form Bot.\n\nUse following chat ID to receive form submissions: \`${ctx.chat.id}\``,
    { parse_mode: "Markdown" }
  )
);

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    await bot.launch();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
