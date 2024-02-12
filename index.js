import { createProvider } from "@bot-whatsapp/bot"
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys"
import dotenv from 'dotenv'

dotenv.config()

const TOKEN = process.env.TOKEN

const main = async () => {
  const provider = createProvider(BaileysProvider)

  provider.initHttpServer(3000)

  provider.http.server.post('/send-message', handleCtx(async (bot, req, res) => {
    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      res.end('Unauthorized')
      return
    }

    const { phone, message, media } = req.body
    try {
      await bot.sendMessage(phone, message, { media })
      res.end('Message sent')
    } catch (error) {
      res.end('Error')
    }
  }))
}

main()