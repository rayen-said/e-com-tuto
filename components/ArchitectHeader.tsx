'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LAYERS_INFO } from '@/lib/data';
import {
  IconCart,
  IconChevronDown,
  IconLayers,
  IconMenu,
  IconTerminal,
  IconX,
} from './Icons';

interface ArchitectHeaderProps {
  xrayActive: boolean;
  onToggleXray: () => void;
  onOpenLayerModal: (num: number) => void;
  cartCount: number;
  logCount: number;
}

const NAV_LINKS = [
  { href: '/', label: 'Accueil', layer: 1 },
  { href: '/catalogue', label: 'Catalogue', layer: 2 },
  { href: '/avis', label: 'Avis', layer: 4 },
  { href: '/panier', label: 'Panier', layer: 5 },
  { href: '/paiement', label: 'Paiement', layer: 6 },
  { href: '/laboratoire', label: 'Laboratoire', layer: 7 },
] as const;

export default function ArchitectHeader({
  xrayActive,
  onToggleXray,
  onOpenLayerModal,
  cartCount,
  logCount,
}: ArchitectHeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  function isActiveLink(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/catalogue') {
      return pathname === '/catalogue' || pathname.startsWith('/produits/');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      id="architect-bar"
      className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Identité StackCraft Commerce */}
        <Link
          href="/"
          aria-label="StackCraft Commerce — Accueil"
          className="inline-flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
        >
          <span className="w-8 h-8 rounded-lg border border-slate-200 bg-[#fafafa] flex items-center justify-center text-[#0b1220]">
            <IconLayers className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-[#0b1220] whitespace-nowrap">
            StackCraft<span className="hidden min-[420px]:inline">&nbsp;Commerce</span>
          </span>
        </Link>

        {/* Navigation principale (desktop) */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 ${
                  active
                    ? 'text-[#0b1220] bg-[#fafafa]'
                    : 'text-slate-600 hover:text-[#0b1220] hover:bg-[#fafafa]'
                }`}
              >
                {item.href === '/panier' && <IconCart className="w-3.5 h-3.5 text-slate-600" />}
                {item.href === '/laboratoire' && (
                  <IconTerminal className="w-3.5 h-3.5 text-cyan-700" />
                )}
                <span>{item.label}</span>
                {item.href === '/panier' && (
                  <span
                    className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded border ${
                      cartCount > 0
                        ? 'bg-[#0b1220] text-white border-[#0b1220]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                    aria-label={`${cartCount} article${cartCount > 1 ? 's' : ''} dans le panier`}
                  >
                    {cartCount}
                  </span>
                )}
                {item.href === '/laboratoire' && (
                  <span
                    className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded border border-cyan-200 bg-cyan-50 text-cyan-800"
                    aria-label={`${logCount} requêtes capturées`}
                  >
                    {logCount}
                  </span>
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-cyan-600"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Contrôles techniques droite */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Accès rapide Panier sur mobile */}
          <Link
            href="/panier"
            className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-[#0b1220] hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
            aria-label={`Panier (${cartCount} articles)`}
          >
            <IconCart className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{cartCount}</span>
          </Link>

          {/* Toggle Mode Inspection X-Ray */}
          <button
            type="button"
            onClick={onToggleXray}
            aria-pressed={xrayActive}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 ${
              xrayActive
                ? 'border-cyan-600 bg-cyan-50 text-cyan-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-[#0b1220]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${
                xrayActive ? 'bg-cyan-600' : 'bg-slate-300'
              }`}
            />
            <span className="hidden xl:inline">Inspection X-Ray</span>
            <span className="xl:hidden">X-Ray</span>
            <span
              className={`hidden sm:inline font-mono text-[11px] font-semibold ${
                xrayActive ? 'text-cyan-800' : 'text-slate-600'
              }`}
            >
              {xrayActive ? 'ACTIF' : 'INACTIF'}
            </span>
          </button>

          {/* Menu déroulant des 7 couches (desktop) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-[#0b1220] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
            >
              <span className="font-mono text-[11px] text-cyan-700 font-semibold">[1-7]</span>
              <span className="hidden xl:inline">Couches</span>
              <IconChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 rounded-lg bg-white border border-slate-200 shadow-popover overflow-hidden z-50"
              >
                <div className="px-3.5 py-2.5 bg-[#fafafa] border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0b1220]">
                    Architecture en 7 couches
                  </span>
                  <span className="text-[11px] text-slate-600">Inspecter</span>
                </div>
                <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                  {Object.values(LAYERS_INFO).map((info) => (
                    <button
                      key={info.num}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenLayerModal(info.num);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#fafafa] transition-colors flex items-start gap-2.5 focus-visible:outline-none focus-visible:bg-cyan-50"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono text-[11px] font-semibold shrink-0">
                        [{info.num}]
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-[#0b1220] truncate">
                          {info.shortTitle}
                        </span>
                        <span className="block text-[11px] text-slate-600 truncate">
                          {info.stack.join(' · ')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bouton menu mobile (< lg) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
            className="lg:hidden p-2 rounded-md border border-slate-200 bg-white text-[#0b1220] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
          >
            {mobileOpen ? <IconX className="w-4 h-4" /> : <IconMenu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-soft">
          <nav aria-label="Navigation mobile" className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${
                    active
                      ? 'bg-[#fafafa] border-cyan-600 text-[#0b1220]'
                      : 'border-transparent text-slate-700 hover:bg-[#fafafa] hover:text-[#0b1220]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-[11px] text-cyan-700">[{item.layer}]</span>
                    <span>{item.label}</span>
                  </span>
                  {item.href === '/panier' && (
                    <span className="font-mono tabular-nums text-xs px-2 py-0.5 rounded bg-slate-100 text-[#0b1220]">
                      {cartCount}
                    </span>
                  )}
                  {item.href === '/laboratoire' && (
                    <span className="font-mono tabular-nums text-xs px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {logCount} req.
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-slate-200 bg-[#fafafa]">
            <p className="text-xs font-medium text-slate-600 mb-2">
              Fiches pédagogiques des 7 couches
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(LAYERS_INFO).map((info) => (
                <button
                  key={info.num}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenLayerModal(info.num);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-mono text-cyan-800 hover:border-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                >
                  [{info.num}]
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
