// ============================================================
// THEME — single source of truth for JS inline styles.
//
// All values resolve to the CSS variables defined in src/index.css.
// Edit the variables there to change the look globally; never
// hand-type a hex color or font stack in component code.
// ============================================================

/** CSS-variable references. Use these in inline styles. */
export const TOKENS = {
  bg: {
    primary: 'var(--bg-primary)',
    elevated: 'var(--bg-elevated)',
    subtle: 'var(--bg-subtle)',
  },
  border: {
    subtle: 'var(--border-subtle)',
    default: 'var(--border-default)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    disabled: 'var(--text-disabled)',
  },
  accent: {
    primary: 'var(--accent-primary)',
    hover: 'var(--accent-hover)',
    muted: 'var(--accent-muted)',
  },
  status: {
    live: 'var(--status-live)',
    exit: 'var(--status-exit)',
    pending: 'var(--status-pending)',
  },
  font: {
    serif: 'var(--font-serif)',
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  motion: {
    fast: 'var(--motion-fast)',
    base: 'var(--motion-base)',
  },
};

/** @deprecated — prefer TOKENS.accent.primary. Kept for backward compatibility. */
export const BRAND = { cyan: TOKENS.accent.primary };

/** @deprecated — prefer TOKENS.font.sans. Kept for backward compatibility. */
export const FONT = TOKENS.font.sans;

/** @deprecated — prefer TOKENS. Kept for backward compatibility with existing imports. */
export const c = {
  bg: TOKENS.bg.primary,
  text: TOKENS.text.primary,
  sub: TOKENS.text.secondary,
  muted: TOKENS.text.tertiary,
  dim: TOKENS.text.disabled,
  border: TOKENS.border.subtle,
  card: TOKENS.bg.elevated,
  cardH: TOKENS.bg.subtle,
  over: TOKENS.bg.primary,
  modal: TOKENS.bg.elevated,
};
