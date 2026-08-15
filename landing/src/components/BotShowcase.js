import { Send, Smartphone, RefreshCw } from 'lucide-react';

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'https://t.me/hakatontest_bot';

export function BotShowcase() {
  return (
    <section id="bot" className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 rounded-3xl border border-border bg-background p-6 md:order-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#229ED9] text-white">
                <Send className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold">MedQueue Bot</p>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-2.5 shadow-sm">
                Salom! Telefon raqamingizni yuboring - Web hisobingiz bilan bog&apos;laymiz. 📱
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
                📱 Raqamni yuborish
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-2.5 shadow-sm">
                ✅ Hisobingiz ulandi! Navbat olish uchun klinikani tanlang.
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <Send className="h-3.5 w-3.5" /> Telegram bot
            </span>
            <h2 className="mt-4 text-3xl font-semibold">Web va bot — bitta hisob</h2>
            <p className="mt-4 text-muted">
              Telefon raqamingiz orqali botni hisobingizga ulang. Web&apos;da olingan
              navbat botda, bot orqali olingan navbat esa Web&apos;da darhol ko&apos;rinadi
              — alohida ro&apos;yxatdan o&apos;tishning hojati yo&apos;q.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-muted"><Smartphone className="h-4 w-4 text-primary" /> Bir marta ulanish, doim sinxron</li>
              <li className="flex items-center gap-2 text-muted"><RefreshCw className="h-4 w-4 text-primary" /> Real vaqtda ikkala tomonda ham yangilanadi</li>
            </ul>
            <a
              href={BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              <Send className="h-4 w-4" /> Botni ochish
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
