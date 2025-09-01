export interface User {
  id: string
  email: string
  name: string
  nickname?: string
  role: 'audience' | 'host' | 'moderator' | 'admin'
}

export interface Room {
  id: string
  name: string
  status: 'active' | 'paused' | 'closed'
  theme: RoomTheme
  createdAt: string
  updatedAt: string
}

export interface RoomTheme {
  textColor?: string
  speed?: number
  lanes?: number
  fontFamily?: string
  reactionSpawnRate?: number
}

export interface Message {
  id: string
  roomId: string
  content: string
  anonymous: boolean
  status: 'pending' | 'approved' | 'rejected'
  user?: {
    name: string
    nickname?: string
  }
  createdAt: string
}

export interface Reaction {
  id: string
  roomId: string
  emoji: string
  mode: 'rain' | 'burst'
  createdAt: string
}

export interface SocketEvents {
  'message.approved': Message
  'message.rejected': { id: string }
  'reaction.push': {
    roomId: string
    emoji: string
    mode: string
    at: string
  }
  'room.cleared': {
    roomId: string
    at: string
  }
  'room.paused': {
    roomId: string
    paused: boolean
    at: string
  }
  'theme.updated': {
    roomId: string
    delta: Partial<RoomTheme>
    at: string
  }
}