"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, LogOut, User } from "lucide-react"

interface Message {
  id: string
  author: string
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onLogout: () => void
}

export function ChatInterface({ onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentUserId = sessionStorage.getItem("user_id") || "user"

  // Mock messages data
  const generateMockMessages = (page: number): Message[] => {
    const mockMessages: Message[] = []
    const startId = (page - 1) * 10

    for (let i = 0; i < 10; i++) {
      const id = startId + i
      mockMessages.push({
        id: `msg_${id}`,
        author: `user${(id % 5) + 1}`,
        content: `Message de test numéro ${id + 1}. Ceci est un exemple de contenu de message.`,
        timestamp: new Date(Date.now() - id * 60000), // Messages every minute
      })
    }

    return mockMessages
  }

  // Load initial messages
  useEffect(() => {
    const initialMessages = generateMockMessages(1)
    setMessages(initialMessages.reverse())

    // Simulate having more messages for first few pages
    setHasMoreMessages(currentPage < 5)
  }, [])

  const loadMoreMessages = () => {
    if (!hasMoreMessages || isLoading) return

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1
      const newMessages = generateMockMessages(nextPage)

      setMessages((prev) => [...prev, ...newMessages.reverse()])
      setCurrentPage(nextPage)
      setHasMoreMessages(nextPage < 5) // Simulate finite messages
      setIsLoading(false)
    }, 1000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      author: currentUserId,
      content: newMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [message, ...prev])
    setNewMessage("")

    // Simulate API call to save message
    // In real implementation, this would save to database
    console.log("Message saved:", message)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Messages</CardTitle>
              <p className="text-sm text-muted-foreground">Connecté en tant que {currentUserId}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate =
                index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className={`flex gap-3 ${message.author === currentUserId ? "justify-end" : "justify-start"}`}>
                    {message.author !== currentUserId && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-[70%] ${message.author === currentUserId ? "order-first" : ""}`}>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.author === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.author !== currentUserId && (
                          <p className="text-xs font-medium text-muted-foreground mb-1">{message.author}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">{formatTime(message.timestamp)}</p>
                    </div>

                    {message.author === currentUserId && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {hasMoreMessages && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={loadMoreMessages}
                disabled={isLoading}
                className="gap-2 bg-transparent"
              >
                {isLoading ? "Chargement..." : "Charger plus de messages"}
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1"
                maxLength={500}
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
