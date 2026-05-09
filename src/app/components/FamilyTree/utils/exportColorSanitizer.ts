const UNSUPPORTED_COLOR_FUNCTIONS = ['oklch(', 'oklab('];

function hasUnsupportedColor(value: string | null | undefined) {
  if (!value) return false;
  const lower = value.toLowerCase();
  return UNSUPPORTED_COLOR_FUNCTIONS.some((fn) => lower.includes(fn));
}

function replaceUnsupportedColors(value: string) {
  return value
    .replace(/oklch\([^)]*\)/gi, '#111827')
    .replace(/oklab\([^)]*\)/gi, '#111827');
}

function safeValueForProperty(property: string) {
  const normalized = property.toLowerCase();

  if (normalized.includes('background-image') || normalized.includes('image')) return 'none';
  if (normalized.includes('background')) return '#ffffff';
  if (normalized.includes('border')) return '#e5e7eb';
  if (normalized.includes('outline')) return '#e5e7eb';
  if (normalized.includes('shadow')) return 'none';
  if (normalized.includes('stroke')) return '#94a3b8';
  if (normalized.includes('fill')) return '#111827';
  if (normalized.startsWith('--')) return '#111827';
  return '#111827';
}

export function sanitizeUnsupportedExportColors(root: HTMLElement) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];

  const cssProperties = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'textDecorationColor',
    'fill',
    'stroke',
    'caretColor',
    'boxShadow',
    'textShadow',
  ] as const;

  elements.forEach((element) => {
    const computed = element.ownerDocument.defaultView?.getComputedStyle(element);
    if (!computed) return;

    cssProperties.forEach((property) => {
      const value = computed[property];

      if (typeof value !== 'string' || !hasUnsupportedColor(value)) {
        return;
      }

      if (property === 'backgroundColor') {
        element.style.backgroundColor = '#ffffff';
        return;
      }

      if (
        property === 'borderTopColor' ||
        property === 'borderRightColor' ||
        property === 'borderBottomColor' ||
        property === 'borderLeftColor'
      ) {
        element.style.borderColor = '#e5e7eb';
        return;
      }

      if (property === 'outlineColor') {
        element.style.outlineColor = '#e5e7eb';
        return;
      }

      if (property === 'fill') {
        element.style.fill = '#111827';
        return;
      }

      if (property === 'stroke') {
        element.style.stroke = '#94a3b8';
        return;
      }

      if (property === 'boxShadow') {
        element.style.boxShadow = 'none';
        return;
      }

      if (property === 'textShadow') {
        element.style.textShadow = 'none';
        return;
      }

      element.style.color = '#111827';
    });

    const inlineStyle = element.getAttribute('style');
    if (inlineStyle && hasUnsupportedColor(inlineStyle)) {
      element.setAttribute('style', replaceUnsupportedColors(inlineStyle));
    }

    Array.from(computed).forEach((propertyName) => {
      const value = computed.getPropertyValue(propertyName);
      if (!hasUnsupportedColor(value)) return;

      element.style.setProperty(
        propertyName,
        safeValueForProperty(propertyName),
        'important'
      );
    });
  });
}

export function injectExportSafeCss(doc: Document) {
  const style = doc.createElement('style');
  style.setAttribute('data-export-safe-css', 'true');

  style.textContent = `
    :root,
    body,
    * {
      color-scheme: light !important;
    }

    :root {
      --background: #ffffff !important;
      --foreground: #111827 !important;
      --card: #ffffff !important;
      --card-foreground: #111827 !important;
      --popover: #ffffff !important;
      --popover-foreground: #111827 !important;
      --primary: #1f2937 !important;
      --primary-foreground: #ffffff !important;
      --secondary: #f3f4f6 !important;
      --secondary-foreground: #111827 !important;
      --muted: #f3f4f6 !important;
      --muted-foreground: #6b7280 !important;
      --accent: #f3f4f6 !important;
      --accent-foreground: #111827 !important;
      --destructive: #dc2626 !important;
      --destructive-foreground: #ffffff !important;
      --border: #e5e7eb !important;
      --input: #e5e7eb !important;
      --input-background: #ffffff !important;
      --ring: #93c5fd !important;
      --chart-1: #2563eb !important;
      --chart-2: #059669 !important;
      --chart-3: #d97706 !important;
      --chart-4: #7c3aed !important;
      --chart-5: #dc2626 !important;
      --sidebar: #ffffff !important;
      --sidebar-foreground: #111827 !important;
      --sidebar-primary: #1f2937 !important;
      --sidebar-primary-foreground: #ffffff !important;
      --sidebar-accent: #f3f4f6 !important;
      --sidebar-accent-foreground: #111827 !important;
      --sidebar-border: #e5e7eb !important;
      --sidebar-ring: #93c5fd !important;
    }

    .is-exporting-family-tree,
    .is-exporting-family-tree * {
      color-scheme: light !important;
    }
  `;

  doc.head.appendChild(style);
}
