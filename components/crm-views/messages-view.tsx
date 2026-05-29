"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Send, Paperclip, MoreHorizontal, Phone, Video, Star } from "lucide-react"

type Message = {
  id: number
  text: string
  time: string
  isMe: boolean
}

type Conversation = {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  starred: boolean
  messages: Message[]
}

export function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "Ótimo! Vamos agendar a reuniao para amanha?",
      time: "10:30",
      unread: 2,
      online: true,
      starred: true,
      messages: [
        { id: 1, text: "Ola! Tudo bem?", time: "10:00", isMe: false },
        { id: 2, text: "Ola Sarah! Tudo otimo, e voce?", time: "10:05", isMe: true },
        { id: 3, text: "Muito bem! Queria discutir sobre o projeto novo.", time: "10:15", isMe: false },
        { id: 4, text: "Claro! Estou disponivel hoje a tarde.", time: "10:20", isMe: true },
        { id: 5, text: "Ótimo! Vamos agendar a reuniao para amanha?", time: "10:30", isMe: false },
      ],
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      lastMessage: "O contrato foi enviado para revisao.",
      time: "09:45",
      unread: 0,
      online: true,
      starred: false,
      messages: [
        { id: 1, text: "Bom dia! Como esta o andamento do contrato?", time: "09:30", isMe: true },
        { id: 2, text: "O contrato foi enviado para revisao.", time: "09:45", isMe: false },
      ],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "Perfeito, obrigada!",
      time: "Ontem",
      unread: 0,
      online: false,
      starred: true,
      messages: [
        { id: 1, text: "Emily, segue o relatorio que voce pediu.", time: "Ontem", isMe: true },
        { id: 2, text: "Perfeito, obrigada!", time: "Ontem", isMe: false },
      ],
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "DK",
      lastMessage: "Vou verificar e te retorno.",
      time: "Ontem",
      unread: 1,
      online: false,
      starred: false,
      messages: [
        { id: 1, text: "David, conseguiu analisar a proposta?", time: "Ontem", isMe: true },
        { id: 2, text: "Vou verificar e te retorno.", time: "Ontem", isMe: false },
      ],
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversations = conversations.map((c) => {
        if (c.id === selectedConversation.id) {
          const newMsg = {
            id: c.messages.length + 1,
            text: newMessage,
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            isMe: true,
          }
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: newMessage,
            time: "Agora",
          }
        }
        return c
      })
      setConversations(updatedConversations)
      setSelectedConversation(updatedConversations.find((c) => c.id === selectedConversation.id) || null)
      setNewMessage("")
    }
  }

  const toggleStar = (id: number) => {
    setConversations(conversations.map((c) =>
      c.id === id ? { ...c, starred: !c.starred } : c
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mensagens</h2>
        <p className="text-slate-500">Converse com seus contatos e clientes</p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-0 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-slate-200 text-slate-700">
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{conversation.name}</p>
                      {conversation.starred && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    </div>
                    <span className="text-xs text-slate-500">{conversation.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-slate-200 text-slate-700">
                      {selectedConversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-800">{selectedConversation.name}</p>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleStar(selectedConversation.id)}>
                    <Star className={`h-4 w-4 ${selectedConversation.starred ? "fill-amber-400 text-amber-400" : ""}`} />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        message.isMe
                          ? "bg-slate-800 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isMe ? "text-slate-300" : "text-slate-500"}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-slate-50 border-0 rounded-xl"
                  />
                  <Button onClick={handleSendMessage} className="bg-slate-800 hover:bg-slate-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Selecione uma conversa para comecar
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
