import { getVisualPersonCardData } from './app/components/FamilyTree/FamilyTreeVisualCards';
import { obterTodasPessoas, obterTodosRelacionamentos } from './app/services/dataService';
import type { Pessoa, Relacionamento } from './app/types';

const PATHS = new Set(['/mapa-familiar-horizontal', '/linha-geracional']);
const SVG_ID = 'horizontal-parent-child-connector-fix-svg';
const STYLE_ID = 'horizontal-parent-child-connector-fix-style';

let pessoas: Pessoa[] = [];
let relacionamentos: Relacionamento[] = [];
let loaded = false;
let loading = false;
let frame = 0;

type Layout = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  generation: number;
};

function pathName() {
  return window.location.pathname.replace(/\/$/, '');
}

function normalize(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function visible(el: HTMLElement | SVGSVGElement) {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
}

function spouseFilterOff() {
  const mobileScope = document.documentElement.dataset.mobileFamilySpouseScope;
  if (mobileScope === 'direct') return true;
  if (mobileScope === 'extended') return false;

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
  const spouseButtons = buttons.filter((button) => {
    const text = normalize(`${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`);
    return text.includes('todos os conjuges') || text.includes('exibir todos os conjuges');
  });

  if (!spouseButtons.length) return false;
  return spouseButtons.some((button) => (
    button.dataset.sidebarFilterVisualActive === 'false'
    || button.dataset.mobileFamilyFilterActive === 'false'
    || button.dataset.active === 'false'
    || button.getAttribute('aria-pressed') === 'false'
  ));
}

function getSurface() {
  const svg = Array.from(document.querySelectorAll<SVGSVGElement>('[data-family-map-connectors="true"]'))
    .find((item) => visible(item) && item.closest('[data-family-map-horizontal-root="true"]'));
  return svg?.parentElement as HTMLElement | null;
}

function displayMap() {
  const map = new Map<string, string[]>();
  pessoas.forEach((person) => {
    [getVisualPersonCardData(person).displayName, person.nome_completo, person.id]
      .map((item) => normalize(item))
      .filter(Boolean)
      .forEach((name) => {
        const ids = map.get(name) ?? [];
        if (!ids.includes(person.id)) ids.push(person.id);
        map.set(name, ids);
      });
  });
  return map;
}

function matchPersonId(text: string, map: Map<string, string[]>) {
  const normalized = normalize(text);
  return Array.from(map.entries())
    .filter(([name]) => normalized.includes(name) || name.includes(normalized))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1]?.[0] ?? null;
}

function num(value?: string | null) {
  const parsed = Number.parseFloat(String(value ?? '').replace('px', ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function generation(button: HTMLElement) {
  const key = button.dataset.familyMapColorKey;
  if (key === 'tataravos') return 1;
  if (key === 'bisavos') return 2;
  if (key === 'avos') return 3;
  if (key === 'pais') return 4;
  if (key === 'irmaos' || key === 'central' || key === 'conjuge') return 5;
  if (key === 'filhos' || key === 'pets') return 6;
  return undefined;
}

function cardLayouts(surface: HTMLElement) {
  const names = displayMap();
  const result = new Map<string, Layout>();
  Array.from(surface.querySelectorAll<HTMLButtonElement>('button[data-family-map-color-key]')).forEach((button) => {
    if (!visible(button)) return;
    const wrapper = button.parentElement as HTMLElement | null;
    if (!wrapper) return;
    const id = matchPersonId(button.textContent ?? '', names);
    const gen = generation(button);
    const left = num(wrapper.style.left) ?? num(button.style.left);
    const top = num(wrapper.style.top) ?? num(button.style.top);
    if (!id || gen === undefined || left === undefined || top === undefined || result.has(id)) return;
    result.set(id, {
      id,
      left,
      top,
      width: num(wrapper.style.width) ?? button.offsetWidth,
      height: button.offsetHeight || 72,
      generation: gen,
    });
  });
  return result;
}

function add(map: Map<string, Set<string>>, key?: string | null, value?: string | null) {
  if (!key || !value || key === value) return;
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

function parentsByChild() {
  const map = new Map<string, Set<string>>();
  relacionamentos.forEach((rel) => {
    if (rel.tipo_relacionamento === 'pai' || rel.tipo_relacionamento === 'mae') {
      add(map, rel.pessoa_origem_id, rel.pessoa_destino_id);
      return;
    }
    if (rel.tipo_relacionamento === 'filho' || rel.tipo_relacionamento === 'filiacao_sangue' || rel.tipo_relacionamento === 'filiacao_adotiva') {
      add(map, rel.pessoa_destino_id, rel.pessoa_origem_id);
    }
  });
  return map;
}

function groups(layouts: Map<string, Layout>, parentMap: Map<string, Set<string>>) {
  const map = new Map<string, { parents: Layout[]; children: Layout[] }>();
  layouts.forEach((child, childId) => {
    const parents = Array.from(parentMap.get(childId) ?? [])
      .map((id) => layouts.get(id))
      .filter((layout): layout is Layout => Boolean(layout))
      .filter((parent) => parent.left + parent.width <= child.left - 4)
      .sort((a, b) => a.top - b.top);
    if (!parents.length) return;
    if (Math.max(...parents.map((item) => item.generation)) < 4 && child.generation < 5) return;
    const key = parents.map((item) => item.id).sort().join('::');
    const group = map.get(key) ?? { parents, children: [] };
    group.children.push(child);
    map.set(key, group);
  });
  map.forEach((group) => group.children.sort((a, b) => a.top - b.top));
  return Array.from(map.values());
}

function ensureSvg(surface: HTMLElement) {
  const width = num(surface.style.width) ?? surface.scrollWidth;
  const height = num(surface.style.height) ?? surface.scrollHeight;
  let svg = surface.querySelector<SVGSVGElement>(`#${SVG_ID}`);
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = SVG_ID;
    surface.appendChild(svg);
  }
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = '';
  return svg;
}

function path(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

function addPath(svg: SVGSVGElement, points: Array<[number, number]>) {
  const item = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  item.setAttribute('d', path(points));
  svg.appendChild(item);
}

function draw() {
  if (!PATHS.has(pathName()) || !spouseFilterOff()) {
    document.getElementById(SVG_ID)?.remove();
    return;
  }
  if (!loaded) return;
  const surface = getSurface();
  if (!surface) return;
  const layouts = cardLayouts(surface);
  const connectorGroups = groups(layouts, parentsByChild());
  if (!connectorGroups.length) {
    document.getElementById(SVG_ID)?.remove();
    return;
  }
  const svg = ensureSvg(surface);
  connectorGroups.forEach((group, index) => {
    const parentRight = Math.max(...group.parents.map((item) => item.left + item.width));
    const childLeft = Math.min(...group.children.map((item) => item.left));
    const gap = Math.max(16, childLeft - parentRight);
    const trunkX = parentRight + Math.min(42, Math.max(14, gap * 0.32)) + index * 0.8;
    const parentY = group.parents.map((item) => item.top + item.height / 2);
    const childY = group.children.map((item) => item.top + item.height / 2);
    const top = Math.min(...parentY, ...childY);
    const bottom = Math.max(...parentY, ...childY);
    group.parents.forEach((parent) => {
      const y = parent.top + parent.height / 2;
      addPath(svg, [[parent.left + parent.width, y], [trunkX, y]]);
    });
    addPath(svg, [[trunkX, top], [trunkX, bottom]]);
    group.children.forEach((child) => {
      const y = child.top + child.height / 2;
      addPath(svg, [[trunkX, y], [child.left, y]]);
    });
  });
}

function schedule() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    draw();
  });
}

async function load() {
  if (loaded || loading) return;
  loading = true;
  try {
    const [people, rels] = await Promise.all([obterTodasPessoas(), obterTodosRelacionamentos()]);
    pessoas = Array.isArray(people) ? people : [];
    relacionamentos = Array.isArray(rels) ? rels : [];
    loaded = true;
  } catch {
    pessoas = [];
    relacionamentos = [];
  } finally {
    loading = false;
  }
  schedule();
}

function styles() {
  const css = `#${SVG_ID}{position:absolute!important;inset:0!important;z-index:9!important;width:100%!important;height:100%!important;pointer-events:none!important;overflow:visible!important}#${SVG_ID} path{fill:none!important;stroke:var(--family-map-connector-color,#f0b898)!important;stroke-width:2.2!important;stroke-linecap:round!important;stroke-linejoin:round!important;opacity:.92!important}`;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }
  if (style.textContent !== css) style.textContent = css;
  if (document.head.lastElementChild !== style) document.head.appendChild(style);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  styles();
  void load();
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-pressed', 'data-active', 'data-sidebar-filter-visual-active', 'data-mobile-family-filter-active', 'data-mobile-family-spouse-scope', 'style', 'class'],
  });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('popstate', schedule, { passive: true });
  window.addEventListener('arvorefamilia:mobile-spouse-filter-changed', schedule);
  [80, 240, 560, 1200, 2200].forEach((delay) => window.setTimeout(schedule, delay));
}

export {};
