import React, { useState, useEffect, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, MessageSquare, Home, Star, CreditCard } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const NotificationBell = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      if (user) {
        fetchNotifications();
        const cleanup = setupRealtimeSubscription();
        return cleanup;
      }
    }, [user]);

    const setupRealtimeSubscription = () => {
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        }, (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    };

    const fetchNotifications = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    const markAsRead = async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
      if (!user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    };

    const getIcon = (type: string) => {
      switch (type) {
        case 'message': return <MessageSquare className="w-4 h-4" />;
        case 'property': return <Home className="w-4 h-4" />;
        case 'review': return <Star className="w-4 h-4" />;
        case 'payment': return <CreditCard className="w-4 h-4" />;
        default: return <Bell className="w-4 h-4" />;
      }
    };

    const formatTime = (dateString: string) => {
      const diff = Date.now() - new Date(dateString).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (minutes < 1) return language === 'ar' ? 'الآن' : 'now';
      if (minutes < 60) return `${minutes}${language === 'ar' ? ' د' : 'm'}`;
      if (hours < 24) return `${hours}${language === 'ar' ? ' س' : 'h'}`;
      return `${days}${language === 'ar' ? ' ي' : 'd'}`;
    };

    if (!user) return null;

    return (
      <div ref={ref} {...props}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="font-semibold">{t('notifications')}</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 me-1" />{t('markAllRead')}
                </Button>
              )}
            </div>
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">{t('noNotifications')}</div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className={`p-2 rounded-full ${notification.is_read ? 'bg-muted' : 'bg-primary/10'}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</span>
                      </div>
                      {!notification.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

NotificationBell.displayName = 'NotificationBell';
export default NotificationBell;
