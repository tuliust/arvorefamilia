import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const SESSION_FILE = process.env.QA_SESSION_FILE || 'qa-session.json';
const OUT_DIR = process.env.QA_OUT_DIR || 'qa-artifacts';
const AUTH_KEY = 'sb-jimymkzejbhuseozunxl-auth-token';
const CONDILENIA = '4b6eb714-a6e3-4a44-a093-01a95d935271';

const relationshipCases = [
  { name: 'Caio Cavalcanti Souza', id: 'b4868ae7-45e0-497c-a627-ec9f415b7acf', must: [/sobrinho/i, /Márcio Ailton/i, /casad/i] },
  { name: 'Absalon Limeira de Souza Neto', id: '25cddc2d-3927-4b68-8dcb-9993d203f3e5', must: [/sobrinho/i, /Márcio Ailton/i, /casad/i] },
  { name: 'Adalberto Bezerra Neto', id: 'ef4fe5f8-3560-4ac9-95c6-41166ee1fa78', must: [/cônjuge/i, /Tath?iane|Tatiane/i, /sobrinha/i, /Márcio Ailton/i] },
  { name: 'Heitor de Albuquerque Tsangaropulos', id: '6b688891-e429-4886-badf-be1f6383c70e', must: [/Condilênia Souza é avó de Heitor Tsangaropulos\./i] },
];

await fs.mkdir(OUT_DIR, { recursive: true });
const bundle = JSON.parse(await fs.readFile(SESSION_FILE, 'utf8'));
const results = [];

const expect = (value, message) => { if (!value) throw new Error(message); };
const errorText = error => error instanceof Error ? error.message : String(error);

async function record(name, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    results.push({ name, status: 'pass', ms: Date.now() - start, detail: detail ?? null });
  } catch (error) {
    results.push({ name, status: 'fail', ms: Date.now() - start, error: errorText(error) });
  }
}

function initScript(session, tutorialSeen) {
  return ({ authKey, session, tutorialSeen }) => {
    localStorage.setItem(authKey, JSON.stringify(session));
    const userId = session?.user?.id;
    if (userId) {
      const key = 'arvorefamilia:first-login-tutorial:v1:' + userId;
      if (tutorialSeen) localStorage.setItem(key, 'seen');
      else localStorage.removeItem(key);
    }
    sessionStorage.removeItem('arvorefamilia:first-login-tutorial-step:v1');
  };
}

async function contextFor(browser, session, opts = {}) {
  const viewport = opts.viewport || { width: 1440, height: 1000 };
  const context = await browser.newContext({
    viewport,
    isMobile: Boolean(opts.mobile),
    hasTouch: Boolean(opts.mobile),
    deviceScaleFactor: opts.mobile ? 2 : 1,
  });
  await context.addInitScript(initScript(session, opts.tutorialSeen !== false), {
    authKey: AUTH_KEY,
    session,
    tutorialSeen: opts.tutorialSeen !== false,
  });
  return { context, page: await context.newPage() };
}

async function goto(page, route) {
  await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('[data-testid="route-loading"]').waitFor({ state: 'hidden', timeout: 12000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {});
  await page.waitForTimeout(700);
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, name + '.png');
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function selectRadixByText(trigger, page, optionText) {
  await trigger.click();
  const option = page.getByRole('option', { name: optionText, exact: true }).last();
  await option.waitFor({ state: 'visible', timeout: 8000 });
  await option.click();
  await page.waitForTimeout(350);
}

async function profileRelationshipText(page, personName) {
  const title = page.getByText(/Seu parentesco com (ela|ele)/i).first();
  await title.waitFor({ state: 'visible', timeout: 12000 });
  const card = title.locator('xpath=ancestor::*[contains(@class,"rounded") or contains(@class,"border")][1]');
  const candidate = card.getByRole('combobox').first();
  let trigger = candidate;
  if (!(await trigger.count())) {
    trigger = page.getByRole('combobox').filter({ hasText: /Selecione uma pessoa/i }).last();
  }
  if (!(await trigger.count())) {
    trigger = page.getByText('Selecione uma pessoa', { exact: true }).last();
  }
  await selectRadixByText(trigger, page, personName);
  await page.waitForTimeout(500);
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}

async function curiosityConnection(page, originName, targetName) {
  await goto(page, '/curiosidades');
  const connectionTab = page.getByText(/Qual a minha conexão\??/i).last();
  await connectionTab.scrollIntoViewIfNeeded().catch(() => {});
  await connectionTab.click().catch(() => {});
  await page.waitForTimeout(500);

  const helper = page.getByText(/Escolha duas pessoas da árvore/i).last();
  await helper.waitFor({ state: 'visible', timeout: 10000 });
  const section = helper.locator('xpath=ancestor::section[1]');
  const combos = section.getByRole('combobox');
  expect(await combos.count() >= 2, 'curiosidades-comboboxes-missing');

  await selectRadixByText(combos.nth(0), page, originName);
  await selectRadixByText(combos.nth(1), page, targetName);
  await section.getByRole('button', { name: /Descobrir conexão/i }).click();
  await page.waitForTimeout(700);
  return (await section.innerText()).replace(/\s+/g, ' ');
}

const browser = await chromium.launch({ headless: true });

try {
  const admin = bundle.admin.session;
  const onboarding = bundle.onboarding.session;

  await record('tutorial: percorre 7 etapas, conclui e não reabre', async () => {
    const env = await contextFor(browser, admin, { tutorialSeen: false });
    try {
      await goto(env.page, '/mapa-familiar');
      let tutorial = env.page.locator('[data-first-login-tutorial="true"]');
      await tutorial.waitFor({ state: 'visible', timeout: 15000 });
      const observed = [];
      for (let guard = 0; guard < 10; guard += 1) {
        tutorial = env.page.locator('[data-first-login-tutorial="true"]');
        if (!(await tutorial.count())) break;
        const text = (await tutorial.innerText()).replace(/\s+/g, ' ');
        const step = text.match(/(\d+) de 7/)?.[1] || '?';
        observed.push(step);
        const finish = tutorial.getByRole('button', { name: /^Concluir$/i });
        if (await finish.count() && await finish.isVisible()) {
          await finish.click();
          break;
        }
        const next = tutorial.getByRole('button', { name: /^Próximo$/i });
        await next.waitFor({ state: 'visible', timeout: 7000 });
        await next.click();
        await env.page.waitForTimeout(250);
      }
      await env.page.locator('[data-first-login-tutorial="true"]').waitFor({ state: 'hidden', timeout: 8000 });
      expect(new Set(observed.filter(x => x !== '?')).size === 7, 'tutorial-steps-observed:' + observed.join(','));
      await env.page.reload({ waitUntil: 'domcontentloaded' });
      await env.page.waitForTimeout(1300);
      expect(await env.page.locator('[data-first-login-tutorial="true"]').count() === 0, 'tutorial-reopened');
      await screenshot(env.page, 'final-tutorial-complete');
      return { observed };
    } finally { await env.context.close(); }
  });

  await record('perfil de Condilênia: quatro frases específicas de parentesco', async () => {
    const env = await contextFor(browser, admin);
    try {
      await goto(env.page, '/pessoa/' + CONDILENIA + '?voltar=%2Fmapa-familiar');
      const out = [];
      for (const c of relationshipCases) {
        const text = await profileRelationshipText(env.page, c.name);
        for (const rx of c.must) expect(rx.test(text), 'profile-relationship-missing:' + c.name + ':' + rx);
        expect(!/Há uma ligação familiar entre/i.test(text), 'generic-fallback:' + c.name);
        out.push({ name: c.name, ok: true });
      }
      await screenshot(env.page, 'final-profile-relationships');
      return out;
    } finally { await env.context.close(); }
  });

  await record('Curiosidades: mesmas quatro frases de conexão', async () => {
    const env = await contextFor(browser, admin);
    try {
      const out = [];
      for (const c of relationshipCases) {
        const text = await curiosityConnection(env.page, 'Condilênia Maria Tsangaropulos Souza', c.name);
        for (const rx of c.must) expect(rx.test(text), 'curiosity-relationship-missing:' + c.name + ':' + rx);
        expect(!/Há uma ligação familiar entre/i.test(text), 'curiosity-generic-fallback:' + c.name);
        out.push({ name: c.name, ok: true });
      }
      await screenshot(env.page, 'final-curiosidades-relationships');
      return out;
    } finally { await env.context.close(); }
  });

  await record('onboarding: cinco rotas internas do fluxo permanecem acessíveis', async () => {
    const env = await contextFor(browser, onboarding, { viewport: { width: 390, height: 844 }, mobile: true });
    try {
      const routes = ['/meus-dados','/meus-vinculos','/arquivos-historicos','/preferencias','/revisao-dados'];
      const checked = [];
      for (const route of routes) {
        await goto(env.page, route);
        const pathname = new URL(env.page.url()).pathname;
        expect(pathname === route, 'onboarding-route-blocked:' + route + '->' + pathname);
        const text = (await env.page.locator('body').innerText()).trim();
        expect(text.length > 80, 'onboarding-route-empty:' + route);
        checked.push(route);
      }
      return checked;
    } finally { await env.context.close(); }
  });

  for (const width of [320, 375, 390, 430]) {
    await record('mobile ' + width + ': toolbar visível e mapa completo', async () => {
      const env = await contextFor(browser, admin, { viewport: { width, height: 844 }, mobile: true });
      try {
        await goto(env.page, '/mapa-familiar');
        const details = [];
        for (const action of ['formato','cor','filtros']) {
          const visible = env.page.locator('[data-mobile-family-map-toolbar-action="' + action + '"]:visible').last();
          await visible.waitFor({ state: 'visible', timeout: 10000 });
          await visible.click();
          await env.page.waitForTimeout(250);
          const tray = env.page.locator('[data-mobile-family-map-context-tray="true"]:visible');
          expect(await tray.count() > 0, 'tray-not-visible:' + action);
          details.push(action);
          await visible.click().catch(() => env.page.keyboard.press('Escape'));
          await env.page.waitForTimeout(200);
        }

        const mapButton = env.page.locator('[data-mobile-family-map-toolbar-action="zoom"]:visible').last();
        await mapButton.click();
        const fullButton = env.page.getByRole('button', { name: /Exibir mapa completo/i }).filter({ visible: true }).last();
        if (!(await fullButton.count())) {
          const fallback = env.page.locator('[data-mobile-family-full-map-button="true"]:visible').last();
          await fallback.waitFor({ state: 'visible', timeout: 7000 });
          await fallback.click();
        } else {
          await fullButton.click();
        }
        const fullLayer = env.page.locator('[data-mobile-family-map-full-layer="true"]:visible, [data-mobile-family-map-full-inline="true"]:visible');
        await fullLayer.first().waitFor({ state: 'visible', timeout: 8000 });
        await screenshot(env.page, 'final-mobile-' + width + '-full-map');
        return { width, panels: details, fullMap: true };
      } finally { await env.context.close(); }
    });

    await record('mobile ' + width + ': linha geracional mede colisão da barra inferior', async () => {
      const env = await contextFor(browser, admin, { viewport: { width, height: 844 }, mobile: true });
      try {
        await goto(env.page, '/linha-geracional');
        const nav = env.page.locator('nav:visible').filter({ has: env.page.getByRole('button', { name: 'Abrir Home' }) }).last();
        await nav.waitFor({ state: 'visible', timeout: 10000 });
        const metrics = await nav.locator('button').evaluateAll(buttons => buttons.map(btn => {
          const r = btn.getBoundingClientRect();
          const span = btn.querySelector('span');
          const sr = span?.getBoundingClientRect();
          return {
            label: span?.textContent?.trim() || btn.getAttribute('aria-label'),
            button: { left: r.left, right: r.right, width: r.width },
            labelBox: sr ? { left: sr.left, right: sr.right, width: sr.width, scrollWidth: span.scrollWidth, clientWidth: span.clientWidth } : null,
          };
        }));
        const collisions = [];
        for (let i = 0; i < metrics.length - 1; i += 1) {
          const a = metrics[i]?.labelBox;
          const b = metrics[i+1]?.labelBox;
          if (a && b && a.right > b.left + 0.5) collisions.push([metrics[i].label, metrics[i+1].label]);
        }
        await screenshot(env.page, 'final-mobile-' + width + '-bottom-nav');
        if (collisions.length) throw new Error('bottom-nav-label-collision:' + JSON.stringify({ width, collisions, metrics }));
        return { width, collisions: [], metrics };
      } finally { await env.context.close(); }
    });
  }

  await record('Curiosidades desktop: overflow horizontal máximo de 4 px', async () => {
    const env = await contextFor(browser, admin);
    try {
      await goto(env.page, '/curiosidades');
      const diag = await env.page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      await screenshot(env.page, 'final-curiosidades-overflow');
      expect(diag.scrollWidth <= diag.viewport + 4, 'curiosidades-horizontal-overflow:' + JSON.stringify(diag));
      return diag;
    } finally { await env.context.close(); }
  });

} finally {
  await browser.close();
}

const report = {
  checked_at: new Date().toISOString(),
  total: results.length,
  pass: results.filter(x => x.status === 'pass').length,
  fail: results.filter(x => x.status === 'fail').length,
  results,
};
await fs.writeFile(path.join(OUT_DIR, 'qa-final-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
