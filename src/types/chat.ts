export type ChatRole = 'user' | 'them'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  createdAt: number
}
