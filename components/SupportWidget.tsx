'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { SupportMessage } from '@/lib/types';
import { IconMessage, IconX } from './Icons';

interface SupportWidgetProps {
  open: boolean;
  messages: SupportMessage[];
  sending: boolean;
  onToggle: (force?: boolean) => void;
  onSendMessage: (text: string) => void;
}

export default function SupportWidget({
  open,
  messages,
  sending,
  onToggle,
  onSendMessage,
}: SupportWidgetProps) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = input.trim();
    if (!clean || sending) return;
    onSendMessage(clean);
    setInput('');
  }

  return (
    <>
      {/* Bouton flottant discret */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => onToggle(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0b1220] hover:bg-slate-800 text-white text-xs font-medium shadow-popover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
            aria-label="Ouvrir le chat support StackCraft"
          >
            <IconMessage className="w-4 h-4" />
            <span className="hidden sm:inline">Support</span>
          </button>
        </div>
      )}

      {/* Panneau de chat */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat support ingénierie StackCraft"
          className="fixed bottom-5 right-4 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-xl bg-white border border-slate-200 shadow-popover overflow-hidden flex flex-col"
          style={{ maxHeight: '440px' }}
        >
          <div className="px-4 py-3 bg-[#fafafa] border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#0b1220] truncate">
                  Support Architecte StackCraft
                </h4>
                <p className="text-[11px] font-mono text-slate-600 truncate">
                  POST /api/v1/support/messages
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggle(false)}
              aria-label="Fermer le chat support"
              className="p-1.5 rounded-md text-slate-600 hover:text-[#0b1220] hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="p-3.5 space-y-2.5 overflow-y-auto flex-1 text-xs bg-white"
            style={{ minHeight: '200px' }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    m.sender === 'user'
                      ? 'bg-[#0b1220] text-white'
                      : 'bg-[#fafafa] border border-slate-200 text-[#0b1220]'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1 font-mono tabular-nums ${
                      m.sender === 'user' ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2 bg-[#fafafa] border-t border-slate-200 flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={sending}
              onClick={() => onSendMessage('Quels sont les codes promo actifs ?')}
              className="px-2 py-1 rounded bg-white hover:border-cyan-600 border border-slate-200 text-[11px] text-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              Codes promo ?
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => onSendMessage('Comment fonctionne FOR UPDATE ?')}
              className="px-2 py-1 rounded bg-white hover:border-cyan-600 border border-slate-200 text-[11px] text-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              Verrou FOR UPDATE ?
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => onSendMessage('Conformité RGPD ?')}
              className="px-2 py-1 rounded bg-white hover:border-cyan-600 border border-slate-200 text-[11px] text-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              RGPD ?
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question technique..."
              aria-label="Votre message au support"
              className="flex-1 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-[#0b1220] placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-3 py-1.5 rounded-md bg-[#0b1220] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
            >
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
