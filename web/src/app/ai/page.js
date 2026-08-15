'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Sparkles, Bot, User, RotateCw, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { aiApi, apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { cn } from '@/lib/cn';

const QUICK_ACTIONS = [
  'Navbat olish',
  'Klinika topish',
  'Shifokor topish',
  'Navbatimni ko\'rish',
  'Tibbiy tariximni ko\'rish',
];

function formatTime(date) {
  return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

export default function AIPage() {
  const { ready, user } = useRequireAuth('patient');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const { data: conversations } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: aiApi.conversations,
    enabled: ready,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['ai-messages', conversations?.[0]?._id],
    queryFn: () => aiApi.messages(conversations[0]._id),
    enabled: ready && Boolean(conversations?.length) && !conversationId,
  });

  useEffect(() => {
    if (history?.length && !conversationId) {
      setMessages(history.map((m) => ({ ...m, id: m._id })));
      setConversationId(conversations[0]._id);
    }
  }, [history, conversations, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (text) => aiApi.send({ message: text, conversationId: conversationId || undefined }),
    onMutate: (text) => {
      setError(null);
      setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() }]);
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { ...data.message, id: data.message._id }]);
    },
    onError: (err) => {
      setError(apiErrorMessage(err));
      toast.error("AI yordamchi bilan aloqa o'rnatilmadi.");
    },
  });

  function handleSend(text) {
    const value = (text ?? input).trim();
    if (!value || sendMutation.isPending) return;
    sendMutation.mutate(value);
    setInput('');
  }

  function handleClear() {
    setMessages([]);
    setConversationId(null);
  }

  if (!ready) return null;

  return (
    <AppShell title="AI yordamchi">
      <div className="mx-auto flex h-[calc(100vh-140px)] max-w-2xl flex-col md:h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="font-semibold">MedQueue AI</p>
              <p className="text-xs text-muted">Sizga qanday yordam beray?</p>
            </div>
          </div>
          {Boolean(messages.length) && (
            <button onClick={handleClear} className="flex items-center gap-1 text-xs text-muted hover:text-error" aria-label="Suhbatni tozalash">
              <Trash2 className="h-3.5 w-3.5" /> Tozalash
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {historyLoading && <p className="text-center text-sm text-muted">Yuklanmoqda...</p>}

          {!messages.length && !historyLoading && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <p className="font-medium">Salom, {user?.fullName?.split(' ')[0]}!</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Men MedQueue yordamchisiman. Klinika topish, shifokor tanlash yoki navbat olishda yordam beraman.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleSend(action)}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary'
                )}
              >
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn('max-w-[80%] space-y-2', m.role === 'user' && 'items-end')}>
                <div
                  className={cn(
                    'whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm',
                    m.role === 'user' ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-surface border border-border'
                  )}
                >
                  {m.content}
                </div>
                {Boolean(m.actions?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {m.actions.map((action) => (
                      <Link
                        key={action.route}
                        href={action.route}
                        className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
                <p className={cn('text-[11px] text-muted', m.role === 'user' && 'text-right')}>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Bot className="h-4 w-4" />
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted" />
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted [animation-delay:0.4s]" />
              </span>
              AI javob tayyorlamoqda...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between rounded-xl bg-error-soft px-4 py-2.5 text-sm text-error">
              {error}
              <button onClick={() => handleSend(messages[messages.length - 1]?.content)} className="flex items-center gap-1 font-medium">
                <RotateCw className="h-3.5 w-3.5" /> Qayta urinish
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-border pt-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingizni yozing..."
            className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="md" disabled={!input.trim()} loading={sendMutation.isPending} aria-label="Yuborish">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
