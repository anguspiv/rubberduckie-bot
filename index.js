import process from "node:process";
import { Bot, IncomingChatPreference } from "@skyware/bot";
import { logger } from "./lib/utils/logger.js";

const QUACK = "*quack*";

logger.info("Starting bot...");

const bot = new Bot({
  emitChatEvents: true,
  chatPreference: IncomingChatPreference.All,
});

try {
  logger.info("Logging in...");

  logger.debug("Logging in with username: ", process.env.BSKY_USERNAME);

  await bot.login({
    identifier: process.env.BSKY_USERNAME,
    password: process.env.BSKY_PASSWORD,
  });

  logger.info("Logged in!");
} catch (err) {
  logger.error("Could not login to bluesky");

  logger.error(err);
}

bot.on("reply", async (post) => {
  logger.info(`Recieved reply: ${post.cid}`);

  try {
    await post.reply({ text: QUACK });
  } catch (err) {
    logger.error(`Could not reply to reply: ${post.cid}`);
    logger.error(err);
  }
});

bot.on("mention", async (post) => {
  logger.info(`Recieved mention: ${post.cid}`);

  try {
    await post.reply({ text: QUACK });
  } catch (err) {
    logger.error(`Could not reply to mention: ${post.cid}`);
    logger.error(err);
  }
});

bot.on("message", async (message) => {
  const sender = await message.getSender();

  logger.info(`Received message from @${sender.handle}: ${message.id}`);

  const conversation = await message.getConversation();

  if (!conversation) {
    return;
  }
  // It may not always be possible to resolve the conversation the message was sent in!

  try {
    await conversation.sendMessage({
      text: QUACK,
    });
  } catch (err) {
    logger.error(`Could not reply to message: ${message.id}`);
    logger.error(err);
  }
});

process.on("beforeExit", (code) => {
  logger.info("Stopping bot...");
  bot.removeAllListeners();
  logger.info(`Process exited with code: ${code}`);
});

process.on("SIGINT", () => {
  bot.removeAllListeners();
  logger.info("Process exited with code: SIGINT");
});

process.on("SIGTERM", () => {
  bot.removeAllListeners();
  logger.info("Process exited with code: SIGTERM");
});
