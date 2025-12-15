import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  partner_id: string;
  partner_name: string;
  partner_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  property_id: string | null;
  property_title: string | null;
}

const MessagesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    ar: {
      title: 'الرسائل',
      noMessages: 'لا توجد رسائل',
      noMessagesDesc: 'ابدأ محادثة مع مالك عقار',
      typeMessage: 'اكتب رسالتك...',
      send: 'إرسال',
      selectConversation: 'اختر محادثة للبدء',
      property: 'بخصوص:',
    },
    fr: {
      title: 'Messages',
      noMessages: 'Aucun message',
      noMessagesDesc: 'Commencez une conversation avec un propriétaire',
      typeMessage: 'Écrivez votre message...',
      send: 'Envoyer',
      selectConversation: 'Sélectionnez une conversation',
      property: 'Concernant:',
    },
    en: {
      title: 'Messages',
      noMessages: 'No Messages',
      noMessagesDesc: 'Start a conversation with a property owner',
      typeMessage: 'Type your message...',
      send: 'Send',
      selectConversation: 'Select a conversation to start',
      property: 'About:',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            setMessages((prev) => [...prev, newMsg]);
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return;
    }

    const conversationMap = new Map<string, Conversation>();

    for (const msg of messagesData || []) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      if (!conversationMap.has(partnerId)) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', partnerId)
          .maybeSingle();

        let propertyTitle = null;
        if (msg.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('title')
            .eq('id', msg.property_id)
            .maybeSingle();
          propertyTitle = propertyData?.title;
        }

        conversationMap.set(partnerId, {
          partner_id: partnerId,
          partner_name: profileData?.full_name || 'مستخدم',
          partner_avatar: profileData?.avatar_url,
          last_message: msg.content,
          last_message_time: msg.created_at,
          unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
          property_id: msg.property_id,
          property_title: propertyTitle,
        });
      } else {
        const conv = conversationMap.get(partnerId)!;
        if (msg.receiver_id === user.id && !msg.is_read) {
          conv.unread_count++;
        }
      }
    }

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id);
  };

  const handleSelectConversation = (partnerId: string) => {
    setSelectedConversation(partnerId);
    fetchMessages(partnerId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const conversation = conversations.find((c) => c.partner_id === selectedConversation);

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedConversation,
      content: newMessage.trim(),
      property_id: conversation?.property_id || null,
    });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-MA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return language === 'ar' ? 'أمس' : 'Hier';
    }
    return date.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-MA');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">{text.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="md:col-span-1 overflow-hidden">
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground">{text.noMessages}</h3>
                  <p className="text-sm text-muted-foreground">{text.noMessagesDesc}</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.partner_id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.partner_id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conv.partner_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conv.partner_avatar || ''} />
                        <AvatarFallback>{conv.partner_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-foreground truncate">
                            {conv.partner_name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conv.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                        {conv.property_title && (
                          <p className="text-xs text-primary truncate">
                            {text.property} {conv.property_title}
                          </p>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={text.typeMessage}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                {text.selectConversation}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;
