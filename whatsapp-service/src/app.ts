import {
  createBot,
  createFlow,
  createProvider,
  MemoryDB as Database,
} from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import 'dotenv/config'

const PORT = process.env.PORT ?? 4000;

const main = async () => {
  const adapterFlow = createFlow([]);

  const adapterProvider = createProvider(Provider);
  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/send-message",
    handleCtx(async (bot, req, res) => {
      try {
        const { number, message } = req.body;
        await bot.sendMessage(number, message, { media: null });
        return res.end("sended");
      } catch (error) {
        console.log(error);
      }
    })
  );

  httpServer(+PORT);
};

main();
