import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SendMessageDialogProps {
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyTitle: string;
  children: React.ReactNode;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  ownerId,
  ownerName,
  propertyId,
  propertyTitle,
  children,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const translations = {
    ar: {
      sendMessage: 'إرسال رسالة',
      to: 'إلى',
      regarding: 'بخصوص',
      messagePlaceholder: 'اكتب رسالتك هنا...',
      send: 'إرسال',
      cancel: 'إلغاء',
      messageSent: 'تم إرسال الرسالة بنجاح',
      loginRequired: 'يجب تسجيل الدخول لإرسال رسالة',
      cantMessageSelf: 'لا يمكنك مراسلة نفسك',
      emptyMessage: 'الرجاء كتابة رسالة',
    },
    en: {
      sendMessage: 'Send Message',
      to: 'To',
      regarding: 'Regarding',
      messagePlaceholder: 'Write your message here...',
      send: 'Send',
      cancel: 'Cancel',
      messageSent: 'Message sent successfully',
      loginRequired: 'Please login to send a message',
      cantMessageSelf: 'You cannot message yourself',
      emptyMessage: 'Please write a message',
    },
    fr: {
      sendMessage: 'Envoyer un Message',
      to: 'À',
      regarding: 'Concernant',
      messagePlaceholder: 'Écrivez votre message ici...',
      send: 'Envoyer',
      cancel: 'Annuler',
      messageSent: 'Message envoyé avec succès',
      loginRequired: 'Veuillez vous connecter pour envoyer un message',
      cantMessageSelf: 'Vous ne pouvez pas vous envoyer un message',
      emptyMessage: 'Veuillez écrire un message',
    },
  };

  const txt = translations[language];

  const handleSend = async () => {
    if (!user) {
      toast.error(txt.loginRequired);
      navigate('/auth');
      return;
    }

    if (user.id === ownerId) {
      toast.error(txt.cantMessageSelf);
      return;
    }

    if (!message.trim()) {
      toast.error(txt.emptyMessage);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: ownerId,
        property_id: propertyId,
        content: message.trim(),
      });

      if (error) throw error;

      toast.success(txt.messageSent);
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{txt.sendMessage}</DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="block">
              {txt.to}: <strong>{ownerName}</strong>
            </span>
            <span className="block">
              {txt.regarding}: <strong>{propertyTitle}</strong>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={txt.messagePlaceholder}
            rows={5}
            className="resize-none"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {txt.cancel}
            </Button>
            <Button onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin me-2" />
              ) : (
                <Send className="w-4 h-4 me-2" />
              )}
              {txt.send}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
