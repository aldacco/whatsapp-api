import BotWhatsapp from '@bot-whatsapp/bot'
import chatGptFlow from './chatGpt.flow.js'
import { createFlow } from '@bot-whatsapp/bot'

export default createFlow(
  [
    chatGptFlow,
  ]
)