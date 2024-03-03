import BotWhatsapp from '@bot-whatsapp/bot';
import { run, runDetermine } from 'src/services/openai';
import chatbotFlow from './chatbot.flow';

export default BotWhatsapp.addKeyword()
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

      const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
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
