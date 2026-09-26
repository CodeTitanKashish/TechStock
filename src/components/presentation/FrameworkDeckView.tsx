import React, { useState, useEffect } from 'react';
import pptxgen from 'pptxgenjs';
import {
  Presentation,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Printer,
  Layers,
  Shield,
  Boxes,
  Cpu,
  Database,
  ArrowRight,
  GitBranch,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  FileText,
  Warehouse,
  FileCode,
  Terminal,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { sound } from '../../utils/audio';

interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  summary: string;
  bullets: string[];
  keyHighlights: { label: string; value: string; desc: string }[];
  diagramType: 'layers' | 'double_entry' | 'rbac' | 'workflow' | 'tech_stack' | 'data_flow' | 'summary';
  footerNote: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    tag: 'Executive Overview',
    title: 'StockSense Enterprise ERP Framework',
    subtitle: 'High-Throughput Multi-Facility Inventory & Perpetual Ledger Architecture',
    summary: 'A next-generation enterprise resource planning (ERP) framework engineered for multi-echelon supply chains, real-time balance reconciliation, and compliance-grade auditability.',
    bullets: [
      'Dual-layer perpetual accounting ensuring zero phantom inventory or reconciliation drift.',
      'Hierarchical facility topology: Hubs, Regional DCs, Forward Sorting Bins, and Quarantine Bays.',
      'Role-Based Access Control (RBAC) with dual-authorization thresholds on high-value movements.',
      'Sub-millisecond local-first state engine with automated offline sync and audit logging.',
    ],
    keyHighlights: [
      { label: 'Architecture', value: 'Perpetual Dual-Entry', desc: 'Mathematical zero-sum ledger' },
      { label: 'Throughput', value: 'Real-Time Sync', desc: 'Sub-millisecond updates' },
      { label: 'Security', value: 'RBAC + Dual-Auth', desc: 'Separation of duties' },
    ],
    diagramType: 'summary',
    footerNote: 'StockSense ERP Framework Architecture • Confidential & Proprietary',
  },
  {
    id: 2,
    tag: 'Layered Architecture',
    title: 'System Architecture & Component Layers',
    subtitle: 'Decoupled presentation, state machine, and ledger persistence stack',
    summary: 'The framework is structured into 4 decoupled layers ensuring high maintainability, fault isolation, and deterministic data flow.',
    bullets: [
      'Presentation Layer: Modular React 19 UI with Tailwind CSS v4 design system and responsive viewport ergonomics.',
      'Orchestration Layer: Centralized Context state machine managing real-time inventory balances and UI reactivity.',
      'Domain Business Logic: Double-entry math validator, threshold evaluator, and barcode generation engine.',
      'Audit & Persistence Layer: Immutable transaction log stream, localStorage durability, and REST API connectors.',
    ],
    keyHighlights: [
      { label: 'Presentation', value: 'React 19 + Tailwind', desc: 'Declarative & responsive UI' },
      { label: 'Domain Core', value: 'Zero-Sum Engine', desc: 'Strict balance validation' },
      { label: 'Audit Trail', value: 'Immutable Stream', desc: 'Every operation logged' },
    ],
    diagramType: 'layers',
    footerNote: 'Layered Modular Software Architecture • StockSense Core',
  },
  {
    id: 3,
    tag: 'Financial Precision',
    title: 'Double-Entry Inventory Accounting Model',
    subtitle: 'Treating physical stock movements with the rigor of financial double-entry bookkeeping',
    summary: 'Every change in stock requires a source credit and destination debit, preventing stock creation out of thin air and guaranteeing balance consistency.',
    bullets: [
      'Inward Goods (PO Receipts): Debits Warehouse Stock and Credits Vendor Inward clearing balance.',
      'Customer Deliveries: Debits Customer Dispatch and Credits Origin Warehouse Available Balance.',
      'Internal Transfers: Relocates quantities across facility bins with an explicit IN_TRANSIT escrow state.',
      'Physical Variance Adjustments: Requires approval workflow and debits/credits the Stock Valuation Variance account.',
    ],
    keyHighlights: [
      { label: 'Receipts', value: '+ Warehouse / - Vendor', desc: 'Inward verification' },
      { label: 'Shipments', value: '- Warehouse / + Dispatch', desc: 'Waybill generated' },
      { label: 'Transfers', value: 'Transit Escrow', desc: 'Loss prevention' },
    ],
    diagramType: 'double_entry',
    footerNote: 'Double-Entry Inventory Ledger • GAAP / IFRS Compatible Design',
  },
  {
    id: 4,
    tag: 'Facility Hierarchy',
    title: 'Multi-Warehouse & Bin Topology',
    subtitle: 'Hierarchical multi-echelon storage modeling from geographical hubs to pick bins',
    summary: 'StockSense models supply chain facilities as hierarchical node trees with capacity constraints, temperature controls, and pick paths.',
    bullets: [
      'Enterprise Distribution Hubs: Primary intake and cross-docking facilities with high cubic capacity.',
      'Regional Forward Depots: Low-latency fulfillment nodes optimized for same-day dispatch.',
      'Micro-Location Aisles & Bins: Addressable bin coordinates (e.g. Z1-A03-B04) for barcode scanning and picking routing.',
      'Quarantine & Return Bays: Isolated zones preventing damaged or uninspected goods from being allocated to sales.',
    ],
    keyHighlights: [
      { label: 'Hubs & DCs', value: 'Multi-Facility', desc: 'Regional routing' },
      { label: 'Bin Precision', value: 'Pick & Pack GPS', desc: 'Addressable coordinates' },
      { label: 'Quarantine', value: 'Quality Isolation', desc: 'Defect containment' },
    ],
    diagramType: 'data_flow',
    footerNote: 'Topology Engine • Multi-Echelon Spatial Representation',
  },
  {
    id: 5,
    tag: 'Lifecycle Workflows',
    title: 'Operations Engine & State Machine',
    subtitle: 'Deterministic state transitions across Goods Intake, Transfers, Picking, and Adjustments',
    summary: 'All inventory movements are governed by a state machine that transitions records safely from Draft to Approved, Picked, and Completed.',
    bullets: [
      'Receipt Workflow: Draft → Received at Dock → Quality Inspection Passed → Putaway Completed.',
      'Dispatch Workflow: Order Created → Inventory Reserved → Pick & Pack → Waybill Dispatched.',
      'Transfer Workflow: Transfer Initiated → Dispatched → In Transit → Received & Bin Placed at Destination.',
      'Threshold Approvals: Movements exceeding valuation limits (e.g. $25,000) automatically require Manager sign-off.',
    ],
    keyHighlights: [
      { label: 'State Transitions', value: 'Deterministic', desc: 'No illegal state leaps' },
      { label: 'Auto-Reservation', value: 'Lock-on-Order', desc: 'Prevents double allocation' },
      { label: 'Approvals', value: 'Threshold-Driven', desc: 'Automated policy checks' },
    ],
    diagramType: 'workflow',
    footerNote: 'State Machine Engine • ISO-9001 Compliance Ready',
  },
  {
    id: 6,
    tag: 'Governance & RBAC',
    title: 'Role-Based Access Control (RBAC) Security',
    subtitle: 'Fine-grained privilege matrix enforcing separation of duties and regulatory compliance',
    summary: 'StockSense enforces least-privilege access across 4 distinct operational roles, maintaining governance across all warehouse activities.',
    bullets: [
      'Admin (Executive): Full system command, role administration, master data creation, and ERP parameter config.',
      'Warehouse Manager: Multi-facility oversight, stock balance reviews, dispatch approvals, and high-value overrides.',
      'Inventory Clerk: Physical receiving, waybill generation, barcode scanning, order picking, and bin relocations.',
      'Compliance Auditor: Read-only ledger inspection, variance analysis, exportable audit certificates, and ledger verification.',
    ],
    keyHighlights: [
      { label: 'Roles', value: '4 Discrete Profiles', desc: 'Admin, Mgr, Clerk, Auditor' },
      { label: 'Auth Guard', value: 'Context Enforcement', desc: 'No privilege escalation' },
      { label: 'Audit Trail', value: 'Cryptographic', desc: 'Non-repudiation log' },
    ],
    diagramType: 'rbac',
    footerNote: 'Security Architecture • SOC-2 Type II & SOX Compliance Alignment',
  },
  {
    id: 7,
    tag: 'Immutable Audit Trail',
    title: 'Perpetual Ledger & Event Telemetry',
    subtitle: 'Continuous timestamped audit logs with variance tracking and exportable records',
    summary: 'Every action performed within the ERP emits a structured audit telemetry event, permanently recording who, what, when, and valuation delta.',
    bullets: [
      'Immutable Event Log: Captures user identity, IP/workstation, timestamp, entity reference, and severity level.',
      'Perpetual Valuation: Real-time calculation of total asset value across moving-average and standard cost methods.',
      'Reconciliation Reports: One-click export of stock variance logs, cycle count sheets, and tax compliance certificates.',
      'Self-Healing Data Sync: Validates sum of all movement debits against physical bin quantities.',
    ],
    keyHighlights: [
      { label: 'Ledger Type', value: 'Append-Only', desc: 'Tamper-evident records' },
      { label: 'Valuation', value: 'Real-Time WAC', desc: 'Weighted average cost' },
      { label: 'Export Formats', value: 'CSV / PDF / PPTX', desc: 'Instant auditor handoff' },
    ],
    diagramType: 'summary',
    footerNote: 'Audit & Compliance Engine • Non-Destructive Ledger Architecture',
  },
  {
    id: 8,
    tag: 'Technology Stack',
    title: 'Modern Technology Stack & Integration APIs',
    subtitle: 'Cloud-native, lightweight, and ultra-fast client-side reactive architecture',
    summary: 'Engineered with modern web standards for maximum responsiveness, zero runtime lag, and seamless enterprise ERP interoperability.',
    bullets: [
      'Frontend Framework: React 19 + TypeScript for type-safe components and resilient lifecycle state.',
      'Styling & Theme: Tailwind CSS v4 with dual Midnight Obsidian and Daylight Studio themes.',
      'Data Visualization: Recharts analytical dashboard with interactive valuation graphs and velocity metrics.',
      'Interoperability: OpenAPI / REST JSON endpoints for SAP, Oracle NetSuite, and barcode scanner hardware integration.',
    ],
    keyHighlights: [
      { label: 'Frontend', value: 'React 19 + TS', desc: 'Type-safe reactivity' },
      { label: 'Theme System', value: 'Tailwind v4', desc: 'Dark / Light modes' },
      { label: 'Export Engine', value: 'Native PPTXGen', desc: 'Direct PPTX rendering' },
    ],
    diagramType: 'tech_stack',
    footerNote: 'Technology Stack & API Specs • Open Architecture',
  },
];

export const FrameworkDeckView: React.FC = () => {
  const { showToast } = useInventory();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingPptx, setGeneratingPptx] = useState(false);

  const currentSlide = SLIDES[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (currentSlideIndex < SLIDES.length - 1) {
          sound.playClick();
          setCurrentSlideIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) {
          sound.playClick();
          setCurrentSlideIndex(prev => prev - 1);
        }
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen(prev => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isFullscreen]);

  // Export real PowerPoint .pptx file
  const handleDownloadPptx = async () => {
    sound.playClick();
    setGeneratingPptx(true);

    try {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';
      pres.author = 'StockSense ERP Team';
      pres.company = 'StockSense Enterprise';
      pres.subject = 'StockSense ERP Framework Architecture';
      pres.title = 'StockSense ERP Framework & System Architecture';

      // Define Theme Colors
      const C_NAVY = '0F172A';
      const C_INDIGO = '4F46E5';
      const C_EMERALD = '10B981';
      const C_LIGHT_BG = 'F8FAFC';
      const C_WHITE = 'FFFFFF';
      const C_SLATE_DARK = '1E293B';
      const C_MUTED = '64748B';

      // Slide 1: Cover Slide
      const coverSlide = pres.addSlide();
      coverSlide.background = { color: C_NAVY };

      coverSlide.addText('STOCKSENSE ERP SUITE', {
        x: 0.8,
        y: 1.2,
        w: 8.5,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: C_EMERALD,
        fontFace: 'Arial',
      });

      coverSlide.addText('Enterprise Inventory &\nPerpetual Ledger Framework', {
        x: 0.8,
        y: 1.8,
        w: 11.5,
        h: 1.8,
        fontSize: 34,
        bold: true,
        color: C_WHITE,
        fontFace: 'Arial',
      });

      coverSlide.addText('Comprehensive Architecture, Double-Entry Math, Multi-Warehouse Topology & RBAC Governance Model', {
        x: 0.8,
        y: 4.0,
        w: 11.0,
        h: 0.8,
        fontSize: 15,
        color: '94A3B8',
        fontFace: 'Arial',
      });

      coverSlide.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 5.2,
        w: 11.7,
        h: 0.05,
        fill: { color: C_INDIGO },
      });

      coverSlide.addText('Confidential • Version 2.4 Enterprise Edition • Generated via StockSense Engine', {
        x: 0.8,
        y: 5.5,
        w: 10.0,
        h: 0.4,
        fontSize: 11,
        color: '64748B',
        fontFace: 'Arial',
      });

      // Add Content Slides
      SLIDES.forEach((slide) => {
        const s = pres.addSlide();
        s.background = { color: C_LIGHT_BG };

        // Header Banner
        s.addShape(pres.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.33,
          h: 1.1,
          fill: { color: C_NAVY },
        });

        // Tag & Title
        s.addText(slide.tag.toUpperCase(), {
          x: 0.8,
          y: 0.15,
          w: 8.0,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: C_EMERALD,
          fontFace: 'Arial',
        });

        s.addText(slide.title, {
          x: 0.8,
          y: 0.45,
          w: 10.5,
          h: 0.5,
          fontSize: 20,
          bold: true,
          color: C_WHITE,
          fontFace: 'Arial',
        });

        // Subtitle bar
        s.addText(slide.subtitle, {
          x: 0.8,
          y: 1.3,
          w: 11.5,
          h: 0.4,
          fontSize: 13,
          italic: true,
          color: C_MUTED,
          fontFace: 'Arial',
        });

        // Left Column: Core Pillars / Bullets
        const bulletObjects = slide.bullets.map(b => ({
          text: b,
          options: {
            fontSize: 12,
            color: C_SLATE_DARK,
            bullet: true,
            paraSpaceAfter: 10,
            fontFace: 'Arial',
          },
        }));

        s.addText(bulletObjects, {
          x: 0.8,
          y: 1.9,
          w: 7.2,
          h: 4.2,
          valign: 'top',
        });

        // Right Column: Key Metric / Architecture Cards
        slide.keyHighlights.forEach((kh, i) => {
          const cardY = 1.9 + (i * 1.35);

          // Card Background
          s.addShape(pres.ShapeType.roundRect, {
            x: 8.3,
            y: cardY,
            w: 4.2,
            h: 1.15,
            fill: { color: C_WHITE },
            line: { color: 'CBD5E1', width: 1 },
            rectRadius: 0.1,
          });

          // Label
          s.addText(kh.label.toUpperCase(), {
            x: 8.5,
            y: cardY + 0.1,
            w: 3.8,
            h: 0.25,
            fontSize: 9,
            bold: true,
            color: C_INDIGO,
            fontFace: 'Arial',
          });

          // Value
          s.addText(kh.value, {
            x: 8.5,
            y: cardY + 0.35,
            w: 3.8,
            h: 0.4,
            fontSize: 14,
            bold: true,
            color: C_NAVY,
            fontFace: 'Arial',
          });

          // Desc
          s.addText(kh.desc, {
            x: 8.5,
            y: cardY + 0.75,
            w: 3.8,
            h: 0.3,
            fontSize: 10,
            color: C_MUTED,
            fontFace: 'Arial',
          });
        });

        // Footer
        s.addShape(pres.ShapeType.line, {
          x: 0.8,
          y: 6.8,
          w: 11.7,
          h: 0,
          line: { color: 'E2E8F0', width: 1 },
        });

        s.addText(slide.footerNote, {
          x: 0.8,
          y: 6.9,
          w: 8.0,
          h: 0.3,
          fontSize: 9,
          color: '94A3B8',
          fontFace: 'Arial',
        });

        s.addText(`Slide ${slide.id} of ${SLIDES.length}`, {
          x: 9.8,
          y: 6.9,
          w: 2.7,
          h: 0.3,
          fontSize: 9,
          align: 'right',
          color: '94A3B8',
          fontFace: 'Arial',
        });
      });

      // Write file and trigger download
      await pres.writeFile({ fileName: 'StockSense_ERP_Framework_Architecture.pptx' });
      sound.playSuccess();
      showToast('PPTX Generated', 'Your PowerPoint framework deck has been downloaded.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export Error', 'Could not generate PPTX file.', 'error');
    } finally {
      setGeneratingPptx(false);
    }
  };

  const handleCopyMarkdown = () => {
    sound.playClick();
    const markdownDeck = SLIDES.map(
      s => `## Slide ${s.id}: ${s.title}\n*${s.subtitle}*\n\n**Overview:** ${s.summary}\n\n**Key Points:**\n${s.bullets.map(b => `- ${b}`).join('\n')}\n\n**Architectural Metrics:**\n${s.keyHighlights.map(k => `- **${k.label}**: ${k.value} (${k.desc})`).join('\n')}\n`
    ).join('\n---\n\n');

    navigator.clipboard.writeText(markdownDeck);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to Clipboard', 'Full PowerPoint deck outline copied.', 'info');
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                StockSense ERP Framework Presentation
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                PPTX • 8 Slides
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive architectural deck, double-entry math, topology, and downloadable PowerPoint presentation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
            title="Copy all slides outline to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied Outline' : 'Copy Text Deck'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
            title="Print slide deck"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Slides</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
            title="Toggle fullscreen presentation"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Present'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPptx}
            disabled={generatingPptx}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-60"
            title="Download native PowerPoint presentation (.pptx)"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPptx ? 'Rendering PPTX...' : 'Download .PPTX File'}</span>
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slide Viewport (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[520px]">
            {/* Top Slide Header Bar */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {currentSlide.tag}
                </span>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {currentSlide.title}
                </h2>
                <p className="text-xs text-slate-400">{currentSlide.subtitle}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-sm font-bold text-slate-400">
                  {String(currentSlide.id).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                </span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-0.5">
                  StockSense ERP
                </span>
              </div>
            </div>

            {/* Slide Body */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentSlide.summary}
              </div>

              {/* Core Bullets & Architectural Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Core Pillars (2 cols) */}
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Key Framework Specifications
                  </h3>
                  <div className="space-y-2.5">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          ✓
                        </div>
                        <span className="leading-relaxed">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Metric Callouts (1 col) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Architectural Anchors
                  </h3>
                  <div className="space-y-2">
                    {currentSlide.keyHighlights.map((kh, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                      >
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          {kh.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                          {kh.value}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {kh.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Footer Note */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{currentSlide.footerNote}</span>
                <span className="font-mono text-[10px]">Press ← / → keys or Space to navigate</span>
              </div>
            </div>

            {/* Carousel Navigation Toolbar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentSlideIndex(prev => Math.max(0, prev - 1));
                }}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCurrentSlideIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      currentSlideIndex === idx
                        ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    title={`Go to Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentSlideIndex(prev => Math.min(SLIDES.length - 1, prev + 1));
                }}
                disabled={currentSlideIndex === SLIDES.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Thumbnails & Framework Summary (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Slide Deck Index ({SLIDES.length} Slides)
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    currentSlideIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-1 ring-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    {s.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold block truncate">{s.title}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{s.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PPTX Quick Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md space-y-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Executive Ready Deck</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click <strong>Download .PPTX File</strong> to receive a clean Microsoft PowerPoint file compatible with PowerPoint, Google Slides, Keynote, and LibreOffice.
            </p>
            <button
              type="button"
              onClick={handleDownloadPptx}
              disabled={generatingPptx}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-center transition-colors shadow-xs"
            >
              {generatingPptx ? 'Generating...' : '📥 Download Presentation (.pptx)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
