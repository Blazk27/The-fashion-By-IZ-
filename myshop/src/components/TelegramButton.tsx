import { MessageCircle } from 'lucide-react';
import { loadSettings } from '../pages/AdminPage';

export function TelegramFloatingButton() {
  const settings = loadSettings();
  const telegramUrl = settings.telegram_handle.startsWith('@')
    ? `https://t.me/${settings.telegram_handle.slice(1)}`
    : `https://t.me/${settings.telegram_handle}`;

  return (
    <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-full shadow-lg transition-all hover:scale-105">
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:block">Chat with us</span>
    </a>
  );
}
