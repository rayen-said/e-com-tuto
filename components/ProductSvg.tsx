'use client';

import type { ProductSvgKey } from '@/lib/types';

/**
 * Schémas vectoriels techniques en thème clair minimal (aucun dégradé, aucune image externe).
 */
export default function ProductSvg({ svgKey }: { svgKey: ProductSvgKey }) {
  switch (svgKey) {
    case 'microservices':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Architecture Microservices Cloud et API Gateway"
        >
          <g stroke="#94a3b8" strokeWidth="1.25" fill="none">
            <path d="M88 75 L142 40" />
            <path d="M88 75 L142 75" />
            <path d="M88 75 L142 110" />
            <path d="M214 40 L252 75" />
            <path d="M214 75 L252 75" />
            <path d="M214 110 L252 75" />
          </g>
          <rect
            x="20"
            y="54"
            width="68"
            height="42"
            rx="6"
            fill="#ffffff"
            stroke="#0891b2"
            strokeWidth="1.75"
          />
          <text
            x="54"
            y="72"
            textAnchor="middle"
            fill="#0e7490"
            fontSize="9"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontWeight="700"
          >
            API GW
          </text>
          <text
            x="54"
            y="85"
            textAnchor="middle"
            fill="#475569"
            fontSize="7.2"
            fontFamily="var(--font-jetbrains-mono), monospace"
          >
            JWT · TLS 1.3
          </text>

          <rect x="142" y="25" width="72" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x="178" y="42" textAnchor="middle" fill="#0b1220" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            Catalogue
          </text>

          <rect x="142" y="61" width="72" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x="178" y="78" textAnchor="middle" fill="#0b1220" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            Commandes
          </text>

          <rect x="142" y="97" width="72" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x="178" y="114" textAnchor="middle" fill="#0b1220" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace">
            Paiements
          </text>

          <circle cx="274" cy="75" r="22" fill="#ecfeff" stroke="#0891b2" strokeWidth="1.5" />
          <text
            x="274"
            y="73"
            textAnchor="middle"
            fill="#0e7490"
            fontSize="8"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontWeight="700"
          >
            EDGE
          </text>
          <text
            x="274"
            y="84"
            textAnchor="middle"
            fill="#475569"
            fontSize="7"
            fontFamily="var(--font-jetbrains-mono), monospace"
          >
            HTTP/3
          </text>
        </svg>
      );

    case 'postgres':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Cluster PostgreSQL 16 ACID et Réplication WAL"
        >
          <g stroke="#0891b2" strokeWidth="1.25" strokeDasharray="4 3" fill="none">
            <path d="M124 75 L194 45" />
            <path d="M124 75 L194 105" />
          </g>
          <path
            d="M34 50 v46 c0 8 20 13 44 13 s44-5 44-13 V50"
            fill="#ffffff"
            stroke="#0b1220"
            strokeWidth="1.5"
          />
          <ellipse cx="78" cy="50" rx="44" ry="12" fill="#ecfeff" stroke="#0891b2" strokeWidth="1.5" />
          <text
            x="78"
            y="76"
            textAnchor="middle"
            fill="#0b1220"
            fontSize="9"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontWeight="700"
          >
            PRIMARY PG16
          </text>
          <text
            x="78"
            y="90"
            textAnchor="middle"
            fill="#0e7490"
            fontSize="7.2"
            fontFamily="var(--font-jetbrains-mono), monospace"
          >
            ACID · FOR UPDATE
          </text>

          <rect x="194" y="26" width="100" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.25" />
          <text x="244" y="43" textAnchor="middle" fill="#0b1220" fontSize="8" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            REPLICA LECTURE
          </text>
          <text x="244" y="55" textAnchor="middle" fill="#475569" fontSize="7.2" fontFamily="var(--font-jetbrains-mono), monospace">
            Index GIN tsvector
          </text>

          <rect x="194" y="86" width="100" height="38" rx="6" fill="#ffffff" stroke="#0891b2" strokeWidth="1.25" />
          <text x="244" y="103" textAnchor="middle" fill="#0e7490" fontSize="8" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            WAL STREAMING
          </text>
          <text x="244" y="115" textAnchor="middle" fill="#475569" fontSize="7.2" fontFamily="var(--font-jetbrains-mono), monospace">
            RPO = 0 s · HA
          </text>
        </svg>
      );

    case 'uikit':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Design System Tailwind et Hydratation SSR"
        >
          <rect x="26" y="18" width="268" height="114" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.4" />
          <line x1="26" y1="40" x2="294" y2="40" stroke="#e2e8f0" strokeWidth="1.2" />
          <circle cx="42" cy="29" r="3" fill="#cbd5e1" />
          <circle cx="53" cy="29" r="3" fill="#cbd5e1" />
          <circle cx="64" cy="29" r="3" fill="#0891b2" />
          <rect x="84" y="24" width="124" height="10" rx="5" fill="#f1f5f9" />

          <rect x="40" y="52" width="94" height="66" rx="6" fill="#fafafa" stroke="#e2e8f0" strokeWidth="1.2" />
          <rect x="50" y="62" width="74" height="22" rx="4" fill="#ecfeff" stroke="#a5f3fc" strokeWidth="1" />
          <rect x="50" y="92" width="48" height="6" rx="3" fill="#0b1220" />
          <rect x="50" y="104" width="66" height="5" rx="2.5" fill="#94a3b8" />

          <rect x="146" y="52" width="134" height="28" rx="5" fill="#ecfeff" stroke="#0891b2" strokeWidth="1.25" />
          <text x="213" y="70" textAnchor="middle" fill="#0e7490" fontSize="8.2" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            LCP 0,8 s · WCAG AA
          </text>

          <rect x="146" y="90" width="63" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="177.5" y="107" textAnchor="middle" fill="#0b1220" fontSize="8" fontFamily="var(--font-jetbrains-mono), monospace">
            Tailwind
          </text>

          <rect x="217" y="90" width="63" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="248.5" y="107" textAnchor="middle" fill="#0b1220" fontSize="8" fontFamily="var(--font-jetbrains-mono), monospace">
            SSR Ready
          </text>
        </svg>
      );

    case 'devops':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Pipeline DevOps CI/CD Kubernetes et Observabilité"
        >
          <g stroke="#0891b2" strokeWidth="1.5" fill="none">
            <path d="M74 75 H118" />
            <path d="M188 75 H232" />
          </g>
          <polygon points="48,46 74,61 74,89 48,104 22,89 22,61" fill="#ffffff" stroke="#0b1220" strokeWidth="1.5" />
          <text x="48" y="74" textAnchor="middle" fill="#0b1220" fontSize="8.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            CI/CD
          </text>
          <text x="48" y="86" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="var(--font-jetbrains-mono), monospace">
            GitOps
          </text>

          <rect x="118" y="45" width="70" height="60" rx="8" fill="#ffffff" stroke="#0891b2" strokeWidth="1.5" />
          <text x="153" y="71" textAnchor="middle" fill="#0e7490" fontSize="9.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            K8s
          </text>
          <text x="153" y="84" textAnchor="middle" fill="#475569" fontSize="7.5" fontFamily="var(--font-jetbrains-mono), monospace">
            AutoScale
          </text>
          <text x="153" y="96" textAnchor="middle" fill="#0b1220" fontSize="7" fontFamily="var(--font-jetbrains-mono), monospace">
            3 Zones
          </text>

          <rect x="232" y="45" width="68" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.4" />
          <polyline points="242,86 254,73 264,79 278,60 290,67" fill="none" stroke="#0891b2" strokeWidth="2" />
          <text x="266" y="99" textAnchor="middle" fill="#0b1220" fontSize="7.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="600">
            P99 &lt; 40 ms
          </text>
        </svg>
      );

    case 'redis':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Redis 7.2 RAM et Hash cart:usr_9482"
        >
          <polygon points="160,82 246,108 160,134 74,108" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.4" />
          <polygon points="160,54 246,80 160,106 74,80" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.4" />
          <polygon points="160,24 246,50 160,76 74,50" fill="#ecfeff" stroke="#0891b2" strokeWidth="1.6" />
          <text x="160" y="53" textAnchor="middle" fill="#0e7490" fontSize="9.5" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            REDIS 7.2 RAM
          </text>
          <text x="160" y="84" textAnchor="middle" fill="#0b1220" fontSize="7.8" fontFamily="var(--font-jetbrains-mono), monospace">
            HSET cart:usr_9482
          </text>
          <text x="160" y="112" textAnchor="middle" fill="#475569" fontSize="7.8" fontFamily="var(--font-jetbrains-mono), monospace">
            CACHE HIT : 1,2 ms
          </text>
        </svg>
      );

    case 'payment':
      return (
        <svg
          viewBox="0 0 320 150"
          className="w-full h-36 rounded-lg bg-[#fafafa] border border-slate-200"
          role="img"
          aria-label="Schéma Passerelle Paiement PCI-DSS et Idempotence"
        >
          <rect x="28" y="34" width="138" height="82" rx="8" fill="#ffffff" stroke="#0b1220" strokeWidth="1.5" />
          <rect x="42" y="49" width="26" height="17" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
          <text x="42" y="85" fill="#0b1220" fontSize="8.8" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            tok_1Q8x...PCI
          </text>
          <text x="42" y="101" fill="#475569" fontSize="7.5" fontFamily="var(--font-jetbrains-mono), monospace">
            3DS2 · AES-256
          </text>
          <path d="M170 75 H208" stroke="#0891b2" strokeWidth="1.75" strokeDasharray="4 2" />
          <path
            d="M250 32 L288 46 V76 C288 100 250 116 250 116 C250 116 212 100 212 76 V46 Z"
            fill="#ecfeff"
            stroke="#0891b2"
            strokeWidth="1.6"
          />
          <text x="250" y="72" textAnchor="middle" fill="#0e7490" fontSize="8.8" fontFamily="var(--font-jetbrains-mono), monospace" fontWeight="700">
            PCI-DSS
          </text>
          <text x="250" y="85" textAnchor="middle" fill="#475569" fontSize="7.2" fontFamily="var(--font-jetbrains-mono), monospace">
            IDEMPOTENT
          </text>
        </svg>
      );
  }
}
