import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const LOCAL_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const PROD_URL = process.env.QA_PROD_URL || 'https://familiasouzabarros.com.br';
const SESSION_FILE = process.env.QA_SESSION_FILE || 'qa-session.json';
const OUT_DIR = process.env.QA_OUT_DIR || 'qa-artifacts';
const PROJECT_REF = 'jimymkzejbhuseozunxl';
const AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;
const DECEASED_PERSON_ID = '4b6eb714-a6e3-4a44-a093-01a95d935271';
const PERSPECTIVES = [
  ['Bianca', '0c9ef515-04f5-43d8-b617-d066bb9242c7'],
  ['Charalambos', '624d6766-840f-4b6d-a72f-269be341f008'],
  ['Leonardo', '826de33a-2fcd-4d99-aa02-b1ee6b1d79ad'],
];

await fs.mkdir(OUT_DIR, { recursive: true });
const sessions = JSON.parse(await fs.readFile(SESSION_FILE, 'utf8'));
const results = [];
const storageReadiness = {
  checked_at: new Date().toISOString(),
  local: null,
  production: null,
  ready_for_private: false,
};

function expect(value, message) {
  if (!value) throw new Error(message);
}

function err(error) {
  return error instanceof Error ? error.message : String(error);
}

async function record(name, fn) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, status: 'pass', ms: Date.now() - started, detail: detail ?? null });
  } catch (error) {
    results.push({ name, status: 'fail', ms: Date.now() - started, error: err(error) });
  }
}

function initSession(session, { tutorialSeen = true } = {}) {
  return ({ authKey, session, tutorialSeen }) => {
    localStorage.setItem(authKey, JSON.stringify(session));
    const userId = session?.user?.id;
    if (tutorialSeen && userId) {
      localStorage.setItem(`arvorefamilia:first-login-tutorial:v1:${userId}`, 'seen');
    } else if (userId) {
      localStorage.removeItem(`arvorefamilia:first-login-tutorial:v1:${userId}`);
      sessionStorage.removeItem('arvorefamilia:first-login-tutorial-step:v1');
    }
  };
}

async function makeContext(browser, session, {
  viewport = { width: 1440, height: 1000 },
  mobile = false,
  tutorialSeen = true,
} = {}) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
    acceptDownloads: true,
  });
  await context.addInitScript(initSession(session, { tutorialSeen }), {
    authKey: AUTH_KEY,
    session,
    tutorialSeen,
  });
  const page = await context.newPage();
  const network = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on('response', res => {
    const url = res.url();
    if (url.includes('historical-files') || url.includes('cdnjs.cloudflare.com/ajax/libs/pdf.js')) {
      network.push({ url, status: res.status(), method: res.request().method() });
    }
  });
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('historical-files') || url.includes('cdnjs.cloudflare.com/ajax/libs/pdf.js')) {
      network.push({ url, status: 'failed', method: req.method(), error: req.failure()?.errorText || 'failed' });
    }
  });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  return { context, page, network, pageErrors, consoleErrors };
}

async function goto(page, base, route) {
  await page.goto(new URL(route, base).toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('[data-testid="route-loading"]').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function shot(page, name) {
  const p = path.join(OUT_DIR, name + '.png');
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

async function storageUiProbe(browser, session, base, label) {
  const env = await makeContext(browser, session, { tutorialSeen: true });
  const { page, network } = env;
  try {
    await goto(page, base, `/pessoa/${DECEASED_PERSON_ID}`);
    const open = page.getByRole('button', { name: /^Abrir$/i }).last();
    await open.waitFor({ state: 'visible', timeout: 15000 });
    await open.click();

    const dialog = page.getByRole('dialog').last();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });

    const outcome = await Promise.race([
      dialog.locator('canvas').first().waitFor({ state: 'visible', timeout: 15000 }).then(() => 'canvas'),
      dialog.getByText(/não foi possível|não pôde ser carregado/i).first().waitFor({ state: 'visible', timeout: 15000 }).then(() => 'error'),
    ]).catch(() => 'timeout');

    await page.waitForTimeout(1000);
    await shot(page, `storage-${label}-preview`);

    const dialogText = await dialog.innerText();
    const signedResponses = network.filter(x => /\/storage\/v1\/object\/sign\/historical-files\//.test(x.url));
    const signedOk = signedResponses.some(x => typeof x.status === 'number' && x.status >= 200 && x.status < 400);

    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);

    const downloadButton = page.getByRole('button', { name: /^Baixar$/i }).last();
    await downloadButton.waitFor({ state: 'visible', timeout: 10000 });
    const downloadEvent = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await downloadButton.click();
    const browserDownload = await downloadEvent;
    await page.waitForTimeout(1500);

    const rawDownloadResponses = network.filter(x =>
      /\/storage\/v1\/object\/historical-files\//.test(x.url) &&
      !/\/object\/sign\//.test(x.url)
    );
    const downloadOk = rawDownloadResponses.some(x => typeof x.status === 'number' && x.status >= 200 && x.status < 400);

    return {
      label,
      base,
      preview_outcome: outcome,
      preview_dialog_text: dialogText.slice(0, 800),
      signed_url_seen: signedResponses.length > 0,
      signed_url_ok: signedOk,
      authenticated_download_seen: rawDownloadResponses.length > 0,
      authenticated_download_ok: downloadOk,
      browser_download_event: Boolean(browserDownload),
      network,
      ready: signedOk && downloadOk,
    };
  } finally {
    await env.context.close();
  }
}

const browser = await chromium.launch({ headless: true });

try {
  const adminSession = sessions.admin.session;
  const onboardingSession = sessions.onboarding.session;

  await record('tutorial: 7 etapas concluem e persistem após reload', async () => {
    const env = await makeContext(browser, adminSession, { tutorialSeen: false });
    try {
      await goto(env.page, LOCAL_URL, '/mapa-familiar');
      const tutorial = env.page.locator('[data-first-login-tutorial="true"]');
      await tutorial.waitFor({ state: 'visible', timeout: 15000 });
      expect((await tutorial.innerText()).includes('1 de 7'), 'tutorial-not-at-step-1');
      await shot(env.page, 'followup-tutorial-step-1');
      for (let i = 0; i < 6; i += 1) {
        await tutorial.getByRole('button', { name: /Próximo/i }).click();
        await env.page.waitForTimeout(250);
      }
      await tutorial.getByRole('button', { name: /Concluir/i }).click();
      await tutorial.waitFor({ state: 'hidden', timeout: 10000 });
      await env.page.reload({ waitUntil: 'domcontentloaded' });
      await env.page.waitForTimeout(1500);
      expect(await env.page.locator('[data-first-login-tutorial="true"]').count() === 0, 'tutorial-reopened-after-completion');
      return { persisted: true };
    } finally {
      await env.context.close();
    }
  });

  await record('mapa desktop: perspectivas e filtro de cônjuges', async () => {
    const env = await makeContext(browser, adminSession);
    try {
      await goto(env.page, LOCAL_URL, '/mapa-familiar');
      const selects = env.page.locator('select');
      let target = null;
      for (let i = 0; i < await selects.count(); i += 1) {
        const optionTexts = await selects.nth(i).locator('option').allTextContents();
        if (optionTexts.some(t => /Bianca/i.test(t))) {
          target = selects.nth(i);
          break;
        }
      }
      expect(target, 'perspective-select-not-found');

      const details = [];
      for (const [name, personId] of PERSPECTIVES) {
        await target.selectOption(personId);
        await env.page.waitForURL(url => url.searchParams.get('pessoa') === personId, { timeout: 10000 });
        await env.page.waitForTimeout(600);
        const spouse = env.page.getByRole('button', { name: /Todos os cônjuges|Exibir todos os cônjuges/i }).first();
        const exists = await spouse.count();
        expect(exists > 0, `spouse-filter-missing:${name}`);
        expect(!(await spouse.isDisabled()), `spouse-filter-disabled:${name}`);
        const initialPressed = await spouse.getAttribute('aria-pressed');
        await spouse.click();
        await env.page.waitForTimeout(400);
        const afterPressed = await spouse.getAttribute('aria-pressed');
        details.push({ name, personId, initialPressed, afterPressed });
      }
      await shot(env.page, 'followup-perspectivas');
      return details;
    } finally {
      await env.context.close();
    }
  });

  await record('PDF local: signed URL, canvas/fallback e download autenticado', async () => {
    const result = await storageUiProbe(browser, adminSession, LOCAL_URL, 'local');
    storageReadiness.local = result;
    expect(result.signed_url_ok, 'local-signed-url-not-ok');
    expect(result.authenticated_download_ok, 'local-authenticated-download-not-ok');
    expect(['canvas', 'error'].includes(result.preview_outcome), 'local-preview-no-outcome');
    return result;
  });

  await record('Curiosidades desktop: diagnosticar overflow horizontal', async () => {
    const env = await makeContext(browser, adminSession);
    try {
      await goto(env.page, LOCAL_URL, '/curiosidades');
      const diag = await env.page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const sw = document.documentElement.scrollWidth;
        const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
          .map(el => {
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              cls: String(el.className || '').slice(0, 180),
              text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
              left: Math.round(r.left),
              right: Math.round(r.right),
              width: Math.round(r.width),
              position: getComputedStyle(el).position,
            };
          })
          .filter(x => x.right > vw + 2 || x.left < -2)
          .sort((a, b) => Math.max(b.right - vw, -b.left) - Math.max(a.right - vw, -a.left))
          .slice(0, 20);
        return { vw, sw, offenders };
      });
      await shot(env.page, 'followup-curiosidades-overflow');
      expect(diag.sw <= diag.vw + 4, 'horizontal-overflow:' + JSON.stringify(diag));
      return diag;
    } finally {
      await env.context.close();
    }
  });

  for (const width of [320, 375, 390, 430]) {
    await record(`mobile ${width}px: toolbar abre painéis sem overlay indevido`, async () => {
      const env = await makeContext(browser, adminSession, {
        viewport: { width, height: 844 },
        mobile: true,
        tutorialSeen: true,
      });
      try {
        await goto(env.page, LOCAL_URL, '/mapa-familiar');
        expect(await env.page.locator('[data-first-login-tutorial="true"]').count() === 0, 'tutorial-unexpectedly-open');
        const details = [];
        for (const action of ['formato', 'cor', 'filtros']) {
          const btn = env.page.locator(`[data-mobile-family-map-toolbar-action="${action}"]`).first();
          await btn.waitFor({ state: 'visible', timeout: 10000 });
          try {
            await btn.click({ timeout: 6000 });
          } catch (error) {
            const point = await btn.evaluate(el => {
              const r = el.getBoundingClientRect();
              const x = r.left + r.width / 2;
              const y = r.top + r.height / 2;
              const top = document.elementFromPoint(x, y);
              return { x, y, tag: top?.tagName, cls: String((top as HTMLElement)?.className || ''), text: String(top?.textContent || '').slice(0, 120) };
            });
            throw new Error(`toolbar-click-blocked:${action}:${JSON.stringify(point)}:${err(error)}`);
          }
          await env.page.waitForTimeout(350);
          const tray = env.page.locator(`[data-mobile-family-map-context-tray="true"][data-mobile-family-map-context-action="${action}"]`);
          const anyDialog = env.page.getByRole('dialog').filter({ hasNot: env.page.locator('[data-first-login-tutorial="true"]') });
          details.push({ action, tray: await tray.count(), dialogs: await anyDialog.count() });
          await btn.click({ timeout: 6000 }).catch(() => env.page.keyboard.press('Escape'));
          await env.page.waitForTimeout(250);
        }

        const mapBtn = env.page.locator('[data-mobile-family-map-toolbar-action="zoom"]').first();
        await mapBtn.click({ timeout: 6000 });
        await env.page.getByText(/Mapa da família/i).first().waitFor({ state: 'visible', timeout: 7000 });
        const cta = env.page.getByRole('button', { name: /Exibir mapa completo/i }).first();
        await cta.waitFor({ state: 'visible', timeout: 7000 });
        await cta.click();
        const full = env.page.locator('[data-mobile-family-map-full-layer="true"]');
        await full.waitFor({ state: 'visible', timeout: 7000 });
        await shot(env.page, `followup-mobile-${width}-full-map`);
        return details;
      } finally {
        await env.context.close();
      }
    });

    await record(`mobile ${width}px: navegação inferior sem rótulos sobrepostos`, async () => {
      const env = await makeContext(browser, adminSession, {
        viewport: { width, height: 844 },
        mobile: true,
        tutorialSeen: true,
      });
      try {
        await goto(env.page, LOCAL_URL, '/linha-geracional');
        const diag = await env.page.evaluate(() => {
          const navs = Array.from(document.querySelectorAll<HTMLElement>('nav')).filter(n => {
            const s = getComputedStyle(n);
            const r = n.getBoundingClientRect();
            return (s.position === 'fixed' || s.position === 'sticky') && r.bottom >= innerHeight - 8 && r.height > 40;
          });
          const nav = navs.at(-1);
          if (!nav) return { found: false, items: [] };
          const items = Array.from(nav.querySelectorAll<HTMLElement>('a,button')).filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && String(el.textContent || '').trim();
          }).map(el => ({
            text: String(el.textContent || '').replace(/\s+/g, ' ').trim(),
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            left: Math.round(el.getBoundingClientRect().left),
            right: Math.round(el.getBoundingClientRect().right),
          }));
          return { found: true, items };
        });
        await shot(env.page, `followup-mobile-${width}-bottom-nav`);
        expect(diag.found, 'bottom-nav-not-found');
        const overflowing = diag.items.filter(x => x.scrollWidth > x.clientWidth + 2);
        expect(overflowing.length === 0, 'bottom-nav-label-overflow:' + JSON.stringify(overflowing));
        return diag;
      } finally {
        await env.context.close();
      }
    });
  }

  await record('onboarding: /forum redireciona para /meus-dados após checagem assíncrona', async () => {
    const env = await makeContext(browser, onboardingSession, {
      viewport: { width: 390, height: 844 },
      mobile: true,
      tutorialSeen: true,
    });
    try {
      await env.page.goto(new URL('/forum', LOCAL_URL).toString(), { waitUntil: 'domcontentloaded' });
      await env.page.waitForURL(url => url.pathname === '/meus-dados', { timeout: 12000 }).catch(() => {});
      await env.page.waitForTimeout(1000);
      const current = new URL(env.page.url());
      if (current.pathname !== '/meus-dados') {
        await shot(env.page, 'followup-onboarding-guard-failure');
      }
      expect(current.pathname === '/meus-dados', `guard-failed:${current.pathname}`);
      return { pathname: current.pathname };
    } finally {
      await env.context.close();
    }
  });

  await record('produção: PDF usa signed URL e download autenticado', async () => {
    const result = await storageUiProbe(browser, adminSession, PROD_URL, 'production');
    storageReadiness.production = result;
    storageReadiness.ready_for_private = Boolean(result.signed_url_ok && result.authenticated_download_ok);
    expect(result.signed_url_ok, 'production-signed-url-not-ok');
    expect(result.authenticated_download_ok, 'production-authenticated-download-not-ok');
    return result;
  });

} finally {
  await browser.close();
}

storageReadiness.ready_for_private = Boolean(
  storageReadiness.production?.signed_url_ok &&
  storageReadiness.production?.authenticated_download_ok
);

const report = {
  checked_at: new Date().toISOString(),
  total: results.length,
  pass: results.filter(x => x.status === 'pass').length,
  fail: results.filter(x => x.status === 'fail').length,
  results,
};

await fs.writeFile(path.join(OUT_DIR, 'qa-followup-report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(OUT_DIR, 'storage-readiness.json'), JSON.stringify(storageReadiness, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(JSON.stringify(storageReadiness, null, 2));
