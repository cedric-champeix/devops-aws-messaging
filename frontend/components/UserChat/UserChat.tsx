"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, LogOut, User } from "lucide-react";
import { useAuth } from "react-oidc-context";
import { profile } from "console";

interface Message {
  id: string;
  userName: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface LastEvaluatedKey {
  channel_id: string;
  timestamp_utc_iso8601: string;
}

type UserChatProps = {
  onLogout: () => void;
};

export function UserChat({ onLogout }: UserChatProps) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<
    LastEvaluatedKey | undefined
  >(undefined);

  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getMessages = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        "https://a5qxnwgl51.execute-api.eu-west-1.amazonaws.com/prod/messages",
        {
          method: "GET",
          headers: { Authorization: user.id_token ?? "" },
        }
      );

      const { messages: newMessages, lastEvaluatedKey } = await response.json();

      setMessages(
        newMessages.map(
          (item: any) =>
            ({
              id: item.id,
              userName: item.userName,
              userId: item.userId,
              content: item.content,
              timestamp: new Date(item.timestamp_utc_iso8601),
            } as Message)
        )
      );

      setLastEvaluatedKey(lastEvaluatedKey);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return setMessages([]);
    }
  };

  // Load initial messages
  useEffect(() => {
    getMessages();
  }, []);

  const loadMoreMessages = async () => {
    if (!user || !hasMoreMessages) return;

    try {
      const response = await fetch(
        "https://a5qxnwgl51.execute-api.eu-west-1.amazonaws.com/prod/messages" +
          (lastEvaluatedKey
            ? `?channel_id=${encodeURIComponent(
                lastEvaluatedKey.channel_id
              )}&timestamp_utc_iso8601=${encodeURIComponent(
                lastEvaluatedKey.timestamp_utc_iso8601
              )}`
            : ""),
        {
          method: "GET",
          headers: { Authorization: user.id_token ?? "" },
        }
      );

      const { messages: newMessages, lastEvaluatedKey: newLastEvaluatedKey } =
        await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        ...newMessages.map(
          (item: any) =>
            ({
              id: item.id,
              userName: item.userName,
              userId: item.userId,
              content: item.content,
              timestamp: new Date(item.timestamp_utc_iso8601),
            } as Message)
        ),
      ]);

      setLastEvaluatedKey(newLastEvaluatedKey);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!newMessage.trim()) return;

    console.log(newMessage);

    const message: Partial<Message> = {
      userName: user.profile.name ?? "Unknown",
      userId: user.profile.sub,
      content: newMessage.trim(),
    };

    try {
      await fetch(
        "https://a5qxnwgl51.execute-api.eu-west-1.amazonaws.com/prod/messages",
        {
          method: "POST",
          headers: {
            Authorization: user.id_token ?? "",
          },
          body: JSON.stringify(message),
        }
      );

      setNewMessage("");
      getMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hasMoreMessages = Boolean(lastEvaluatedKey);

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
              <p className="text-sm text-muted-foreground">
                Connecté en tant que {user?.profile?.name}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2 bg-transparent cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                formatDate(message.timestamp) !==
                  formatDate(messages[index - 1].timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex gap-3 ${
                      message.userId === user?.profile?.sub
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.userId !== user?.profile?.sub && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] ${
                        message.userId === user?.profile?.sub
                          ? "order-first"
                          : ""
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.userId === user?.profile?.sub
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.userId !== user?.profile?.sub && (
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {message.userName}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.userId === user?.profile?.sub && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMoreMessages && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={loadMoreMessages}
                className="gap-2 bg-transparent"
              >
                Charger plus de messages
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Input - always at bottom */}
      <div className="w-full bg-white z-10 border-t sticky bottom-0">
        <Card className="rounded-none border-x-0 border-b-0 shadow-none">
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
  );
}
