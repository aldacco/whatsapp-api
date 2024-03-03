import BotWhatsapp from '@bot-whatsapp/bot'
import chatGptFlow from './chatGpt.flow'

export default BotWhatsapp.createFlow(
  [
    chatGptFlow,
  ]
)