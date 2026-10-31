const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function CalculatorIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="2.5" width="14" height="19" rx="3" />
      <path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.4" />
      <path d="M3.5 3.5v4.9h4.9M12 7.5V12l3 2" />
    </svg>
  );
}

export function SlidersIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 7h9M18 7h3M3 17h3M12 17h9" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="9" cy="17" r="2.5" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function SaveIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M5.5 3.5h10l5 5v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
      <path d="M8 3.5v5h7v-5M7.5 20.5v-7h9v7" />
    </svg>
  );
}

export function ArrowDownIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ImportIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function ExportIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
    </svg>
  );
}
