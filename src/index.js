import dotenv from 'dotenv'
dotenv.config()

import OpenAI from "openai"
import { addKeyword, createProvider } from "@bot-whatsapp/bot"
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys"

import { MemoryDB, createBot, createFlow } from "@bot-whatsapp/bot"
import flow from "./flow/index.js"


const TOKEN = process.env.TOKEN

const main = async () => {
  const provider = createProvider(BaileysProvider)

  provider.initHttpServer(process.env.PORT || 3000)

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

  await createBot({
    flow: flow,
    database: new MemoryDB(),
    provider,
  })
}

main()
