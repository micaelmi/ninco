'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { AiChatPanel } from './ai-chat-panel';
import { cn } from '@/lib/utils';

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  if (!isSignedIn || pathname === '/pricing') return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI Chat"
        className={cn(
          'right-6 bottom-6 z-50 fixed flex justify-center items-center shadow-lg rounded-full w-14 h-14',
          'bg-linear-to-br from-emerald-500 to-teal-600 text-white',
          'hover:from-emerald-600 hover:to-teal-700 hover:scale-105',
          'active:scale-95 transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer',
          // Subtle pulse ring when closed
          !isOpen && 'after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-emerald-500/40 after:animate-ping',
          // Push up on mobile when panel is open
          isOpen && 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto'
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <AiChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export { AiChatPanel } from './ai-chat-panel';
export { AiTransactionPreview } from './ai-transaction-preview';
