'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Send, ChevronDown, ChevronUp, X, Sparkles, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTags } from '@/lib/hooks/use-tags';
import { useUser } from '@/lib/hooks/use-user';
import { useAiCredits, useConsumeAiCredit } from '@/lib/hooks/use-ai-credits';
import { parseTransactionMessage, type AiTransactionResult } from '@/lib/ai/gemini';
import { AiTransactionPreview } from './ai-transaction-preview';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_EXAMPLES = [
  { label: 'Simple', example: 'McDonalds $10' },
  { label: 'With category', example: 'Groceries 35.50 Food' },
  { label: 'With date', example: 'Netflix 15, yesterday' },
  { label: 'Full details', example: 'Dinner, $50, main account, yesterday, #Universal' },
  { label: 'Income', example: 'Salary received $3000' },
];

export function AiChatPanel({ isOpen, onClose }: AiChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiTransactionResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const { data: credits } = useAiCredits();
  const { data: userPref } = useUser();
  const consumeCredit = useConsumeAiCredit();

  const isNormalUser = credits?.userType === 'normal';
  const hasCredits = (credits?.remaining ?? 0) > 0;

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    if (!hasCredits) {
      toast.error('You have no AI credits left this month.');
      return;
    }

    setIsLoading(true);
    setAiResult(null);

    try {
      const fallbackAccount = accounts?.find((a: any) =>
        a.name.toLowerCase().includes('main') || a.name.toLowerCase().includes('principal')
      ) || accounts?.[0];

      const result = await parseTransactionMessage(message.trim(), {
        accounts: accounts?.map((a: any) => ({ id: a.id, name: a.name })) || [],
        categories: categories?.map((c: any) => ({ id: c.id, name: c.name, type: c.type })) || [],
        tags: tags?.map((t: any) => ({ id: t.id, name: t.name })) || [],
        defaultAccountId: userPref?.defaultAccountId || fallbackAccount?.id,
      });

      // Consume one credit after successful parse
      await consumeCredit.mutateAsync();

      setAiResult(result);
      if (isGuideOpen) setIsGuideOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Could not understand that message. Please try rephrasing it.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setAiResult(null);
    setMessage('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const creditLabel = isNormalUser ? 'Free' : 'Premium';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="z-40 fixed inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'right-0 bottom-0 z-50 fixed flex flex-col bg-background shadow-2xl border border-border overflow-hidden transition-transform duration-300 ease-in-out',
          // Mobile: full-width bottom sheet
          'w-full sm:w-[420px] sm:bottom-6 sm:right-6 sm:rounded-2xl',
          // Height constraints
          'max-h-[90dvh] sm:max-h-[85vh]',
          // Rounded corners on mobile (only top)
          'rounded-t-2xl',
          isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-[120%]'
        )}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 bg-linear-to-r from-emerald-500 to-teal-600 p-4 rounded-t-2xl shrink-0">
          <div className="relative bg-white/20 rounded-xl w-10 h-10 overflow-hidden shrink-0">
            <Image
              src="/mascot.png"
              alt="Ninco AI"
              fill
              className="p-1 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm">Ninco AI</h2>
            <p className="text-white/80 text-xs">Create a transaction with a message</p>
          </div>

          {/* Credits indicator */}
          {credits && (
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-white/90" />
              <span className="font-medium text-white text-xs whitespace-nowrap">
                {credits.remaining}/{credits.limit} {creditLabel}
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1.5 rounded-full text-white/80 hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-3 p-4 w-full min-h-0 overflow-y-auto">
          {/* Guide */}
          <div className="bg-muted/50 border border-border/50 rounded-xl overflow-hidden">
            <button
              className="flex justify-between items-center gap-2 px-3 py-2.5 w-full text-left"
              onClick={() => setIsGuideOpen(!isGuideOpen)}
            >
              <span className="font-medium text-sm">💡 How to use</span>
              {isGuideOpen
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {isGuideOpen && (
              <div className="space-y-2 px-3 pt-0 pb-3">
                <p className="text-muted-foreground text-xs">
                  Type a message describing your transaction. Include any of these:
                </p>
                <ul className="space-y-1 text-muted-foreground text-xs list-disc list-inside">
                  <li><strong>Amount</strong> – e.g. <code>$10</code> or <code>10</code></li>
                  <li><strong>Description</strong> – e.g. <code>McDonalds</code></li>
                  <li><strong>Date</strong> – e.g. <code>yesterday</code>, <code>2 days ago</code></li>
                  <li><strong>Account</strong> – e.g. <code>main account</code></li>
                  <li><strong>Category</strong> – e.g. <code>Food</code></li>
                  <li><strong>Tags</strong> – prefix with <code>#</code>, e.g. <code>#Universal</code></li>
                </ul>
                <div className="space-y-1 mt-2">
                  {GUIDE_EXAMPLES.map(({ label, example }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setMessage(example);
                        textareaRef.current?.focus();
                      }}
                      className="block w-full text-left"
                    >
                      <span className="text-muted-foreground text-xs">{label}: </span>
                      <span className="bg-background px-1.5 py-0.5 border hover:border-primary rounded font-mono text-xs transition-colors">
                        {example}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* No credits warning */}
          {credits && !hasCredits && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
              <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                You&apos;ve used all your AI credits this month
              </p>
              <p className="mt-1 text-amber-600 dark:text-amber-400 text-xs">
                Credits reset on the 1st of each month.
                {isNormalUser && ' Upgrade to Premium for 100 credits/month.'}
              </p>
            </div>
          )}

          {/* Preview */}
          {aiResult && (
            <AiTransactionPreview
              result={aiResult}
              onReset={handleReset}
              onSuccess={() => {
                onClose();
                setAiResult(null);
                setMessage('');
              }}
            />
          )}
        </div>

        {/* Upgrade plan button (normal users only) */}
        {isNormalUser && (
          <div className="px-3 shrink-0">
            <button
              onClick={() => {
                onClose();
                router.push('/pricing');
              }}
              className="flex justify-center items-center gap-2 bg-linear-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 px-3 py-2 border border-amber-300/50 dark:border-amber-700/50 rounded-xl w-full text-amber-700 dark:text-amber-400 text-xs transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="font-medium">Upgrade plan</span>
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 p-3 border-border border-t shrink-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasCredits ? 'Try "McDonalds $10" or "Salary $3000"…' : 'No credits remaining…'}
            rows={2}
            disabled={isLoading || !hasCredits}
            className="flex-1 min-h-0 text-sm resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || !hasCredits}
            size="icon"
            className="self-end bg-linear-to-br from-emerald-500 hover:from-emerald-600 to-teal-600 hover:to-teal-700 border-0 text-white shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}
