import OpenAI from "openai"

import { addKeyword, createProvider } from "@bot-whatsapp/bot"
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys"
import dotenv from 'dotenv'

import { MemoryDB, createBot, createFlow } from "@bot-whatsapp/bot"

dotenv.config()
const chatGPTFlow = addKeyword('')
  .addAction(async (ctx, { state, gotoFlow }) => {
    try {
      const history = (state.getMyState()?.history ?? [])
      const ai = await runDetermine(history)
      if (ai.toLowerCase().includes('unknown')) {
        return
      }

      if (ai.toLowerCase().includes('chatbot')) {
        return gotoFlow(chatbotFlow)
      }

    } catch (err) {
      console.log(`[ERROR]:`, err)
      return
    }
  })
  .addAction(async (ctx, { flowDynamic, state }) => {
    try {
      const newHistory = (state.getMyState()?.history ?? [])
      const name = ctx?.pushName ?? ''

      console.log(`[HISTORY]:`, newHistory)

      newHistory.push({
        role: 'user',
        content: ctx.body
      })

      const largeResponse = await run(name, newHistory)

      const chunks = largeResponse.split(/(?<!\d)\.\s+/g)
      for (const chunk of chunks) {
        await flowDynamic(chunk)
      }

      newHistory.push({
        role: 'assistant',
        content: largeResponse
      })

      await state.update({ history: newHistory })

    } catch (err) {
      console.log(`[ERROR]:`, err)
    }
  })


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
    flow: createFlow([chatGPTFlow]),
    database: new MemoryDB(),
    provider,
  })
}

main()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const run = async (name, history) => {

  const promtp = '' //generatePrompt(name)
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": promtp
      },
      ...history
    ],
    temperature: 1,
    max_tokens: 800,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })
  return response.choices[0].message.content
}

const runDetermine = async (history) => {

  const promtp = '' //generatePromptDetermine()
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": promtp
      },
      ...history
    ],
    temperature: 1,
    max_tokens: 800,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })
  return response.choices[0].message.content
}
