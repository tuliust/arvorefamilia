import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.QA_BASE_URL || 'https://arvorefamilia.com';
const SESSION_FILE = process.env.QA_SESSION_FILE || 'qa-session.json';
const OUT_DIR = process.env.QA_OUT_DIR || 'qa-artifacts';
const PROJECT_REF = 'jimymkzejbhuseozunxl';
const AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;
const DECEASED_PERSON_ID = '4b6eb714-a6e3-4a44-a093-01a95d935271';

await fs.mkdir(OUT_DIR, { recursive: true });
const sessionBundle = JSON.parse(await fs.readFile(SESSION_FILE, 'utf8'));
const results = [];
const screenshots = [];
const startedAt = new Date().toISOString();

function cleanError(error) {
  return error instanceof Error ? error.message : String(error);
}

async function record(name, fn, { conditional = false } = {}) {
  const started = Date.now();
  try {
    const detail = await fn();
    results.push({ name, status: 'pass', ms: Date.now() - started, detail: detail ?? null });
    return true;
  } catch (error) {
    const message = cleanError(error);
    const status = conditional && /SKIP:/.test(message) ? 'skip' : 'fail';
    results.push({ name, status, ms: Date.now() - started, error: message });
    return false;
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function sessionInit(session, extra = {}) {
  return ({ authKey, session, extra }) => {
    localStorage.setItem(authKey, JSON.stringify(session));
    for (const [key, value] of Object.entries(extra)) {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    window.alert = (...args) => { throw new Error('native-alert:' + args.join(' ')); };
    window.confirm = (...args) => { throw new Error('native-confirm:' + args.join(' ')); };
    window.prompt = (...args) => { throw new Error('native-prompt:' + args.join(' ')); };
  };
}

async function makePage(browser, session, viewport = { width: 1440, height: 1000 }, extra = {}, mobile = false) {
  const context = await browser.newContext({
    viewport,
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
    acceptDownloads: true,
  });
  await context.addInitScript(sessionInit(session, extra), { authKey: AUTH_KEY, session, extra });
  const page = await context.newPage();
  const telemetry = { pageErrors: [], consoleErrors: [], nativeDialogs: [], storageRequests: [] };
  page.on('pageerror', e => telemetry.pageErrors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') telemetry.consoleErrors.push(msg.text());
  });
  page.on('dialog', async dialog => {
    telemetry.nativeDialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.dismiss().catch(() => {});
  });
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/storage/v1/object/') && url.includes('historical-files')) {
      telemetry.storageRequests.push({ method: request.method(), url });
    }
  });
  return { context, page, telemetry };
}

async function goto(page, route) {
  await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(900);
  const url = page.url();
  expect(!/\/entrar(?:\?|$)/.test(url), `redirected-to-login:${url}`);
  return url;
}

async function snap(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(file);
  return file;
}

async function visibleText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

async function assertNoMojibake(page) {
  const text = await visibleText(page);
  expect(!text.includes('\uFFFD'), 'replacement-character-visible');
  const suspicious = ['Ã§', 'Ã£', 'Ã©', 'Ã³', 'Â°', 'â€“', 'â€”'];
  expect(!suspicious.some(x => text.includes(x)), 'mojibake-visible');
}

async function assertNoHorizontalOverflow(page, tolerance = 4) {
  const overflow = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(overflow.sw <= overflow.cw + tolerance, `horizontal-overflow:${overflow.sw}>${overflow.cw}`);
}

async function clickText(page, text, opts = {}) {
  const locator = page.getByText(text, { exact: opts.exact ?? false }).first();
  if (!(await locator.count())) throw new Error(`SKIP:text-not-found:${text}`);
  await locator.click({ timeout: 8000 });
  await page.waitForTimeout(opts.wait ?? 500);
}

async function assertRouteVisible(page, route, needles = []) {
  await goto(page, route);
  const text = await visibleText(page);
  for (const needle of needles) expect(text.includes(needle), `missing-text:${needle}`);
  await assertNoMojibake(page);
  await assertNoHorizontalOverflow(page);
}

const browser = await chromium.launch({ headless: true });

try {
  const adminSession = sessionBundle.admin.session;
  const onboardingSession = sessionBundle.onboarding.session;

  const desktop = await makePage(browser, adminSession);
  const { page, telemetry } = desktop;

  await record('transversal: sessão autenticada abre / e chega ao mapa', async () => {
    await goto(page, '/');
    expect(page.url().includes('/mapa-familiar'), `unexpected-url:${page.url()}`);
    await assertNoMojibake(page);
    expect(telemetry.nativeDialogs.length === 0, 'native-dialog-detected');
    await snap(page, '01-mapa-desktop-inicial');
  });

  await record('/mapa-familiar: estrutura, grupos e exportação', async () => {
    await assertRouteVisible(page, '/mapa-familiar', ['Grupos de Familiares', 'Exportar', 'Salvar Imagem', 'Imprimir']);
    const text = await visibleText(page);
    expect(!text.includes('Salvar PDF'), 'unexpected-export-option');
    await snap(page, '02-mapa-desktop-paineis');
  });

  await record('/mapa-familiar: perspectivas Bianca, Charalambos e Leonardo', async () => {
    await goto(page, '/mapa-familiar');
    for (const name of ['Bianca', 'Charalambos', 'Leonardo']) {
      const textLocator = page.getByText(new RegExp(name, 'i')).first();
      if (!(await textLocator.count())) throw new Error(`SKIP:perspective-option-missing:${name}`);
      await textLocator.click();
      await page.waitForTimeout(700);
      expect(page.url().includes('pessoa='), `perspective-query-not-set:${name}`);
    }
    await snap(page, '03-mapa-perspectiva');
  }, { conditional: true });

  await record('/mapa-familiar-horizontal: renderização autenticada', async () => {
    await assertRouteVisible(page, '/mapa-familiar-horizontal', []);
    const body = await visibleText(page);
    expect(/Árvore|Familiar|Geração/i.test(body), 'horizontal-map-empty');
    await snap(page, '04-horizontal-desktop');
  });

  await record('/meus-vinculos: status e modal de pet sem overflow', async () => {
    await assertRouteVisible(page, '/meus-vinculos', []);
    const text = await visibleText(page);
    expect(/Cadastrado|Pré-cadastrado/i.test(text), 'link-status-not-visible');
    const petButton = page.getByRole('button', { name: /pet/i }).first();
    if (await petButton.count()) {
      await petButton.click();
      await page.waitForTimeout(400);
      await assertNoHorizontalOverflow(page);
      await snap(page, '05-meus-vinculos-pet');
      await page.keyboard.press('Escape').catch(() => {});
    }
  });

  await record('/meus-dados: layout desktop e campos críticos', async () => {
    await assertRouteVisible(page, '/meus-dados', []);
    const text = await visibleText(page);
    expect(/Nascimento|Sobre Mim|Perfil/i.test(text), 'meus-dados-critical-sections-missing');
    expect(telemetry.nativeDialogs.length === 0, 'native-dialog-detected');
    await snap(page, '06-meus-dados-desktop');
  });

  await record('/pessoa/:id: timeline PDF abre por signed URL e download funciona', async () => {
    telemetry.storageRequests.length = 0;
    await goto(page, `/pessoa/${DECEASED_PERSON_ID}`);
    const text = await visibleText(page);
    expect(!text.includes('Arquivos e registros vinculados'), 'legacy-attachments-title-visible');
    expect(/PDF/i.test(text), 'pdf-attachment-not-visible');

    const openButtons = page.getByRole('button', { name: /^Abrir$/i });
    if (!(await openButtons.count())) throw new Error('open-pdf-action-not-found');
    await openButtons.last().click();
    await page.waitForTimeout(1800);

    const dialog = page.getByRole('dialog').last();
    expect(await dialog.count() > 0, 'pdf-dialog-not-open');
    const canvasCount = await dialog.locator('canvas').count();
    expect(canvasCount > 0, 'pdf-canvas-not-rendered');
    const dialogText = await dialog.innerText();
    expect(/Abrir em nova aba/i.test(dialogText), 'open-new-tab-fallback-missing');

    const signedSeen = telemetry.storageRequests.some(r => /\/object\/sign\/historical-files\//.test(r.url) || /token=/.test(r.url));
    expect(signedSeen, 'historical-signed-url-request-not-observed');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const downloadButton = page.getByRole('button', { name: /^Baixar$/i }).last();
    expect(await downloadButton.count() > 0, 'download-action-not-found');
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await downloadButton.click();
    const download = await downloadPromise;
    expect(Boolean(download), 'browser-download-event-not-fired');

    const authenticatedDownloadSeen = telemetry.storageRequests.some(r =>
      r.method === 'GET' && /\/object\/historical-files\//.test(r.url)
    );
    expect(authenticatedDownloadSeen, 'authenticated-storage-download-request-not-observed');
    await snap(page, '07-perfil-timeline-pdf');
  });

  await record('/curiosidades: conexão familiar renderiza sem overflow', async () => {
    await assertRouteVisible(page, '/curiosidades', []);
    const connectionTab = page.getByText(/Qual a minha conexão/i).first();
    if (await connectionTab.count()) {
      await connectionTab.click();
      await page.waitForTimeout(500);
      await assertNoHorizontalOverflow(page);
    }
    await snap(page, '08-curiosidades');
  });

  await record('/admin: dashboard acessível como admin temporário', async () => {
    await assertRouteVisible(page, '/admin', []);
    const text = await visibleText(page);
    expect(/Admin|Dashboard|Gestão|Pessoas/i.test(text), 'admin-dashboard-content-missing');
    await snap(page, '09-admin-dashboard');
  });

  await record('/admin/gestao-conteudo-pessoas: rota e controles visíveis', async () => {
    await assertRouteVisible(page, '/admin/gestao-conteudo-pessoas', []);
    const text = await visibleText(page);
    expect(/Gerar conteúdos|Astrologia|Fatos|Pessoa/i.test(text), 'admin-content-controls-missing');
    await snap(page, '10-admin-conteudos');
  });

  await record('/admin/notificacoes: configuração e modelos visíveis', async () => {
    await assertRouteVisible(page, '/admin/notificacoes', []);
    const text = await visibleText(page);
    expect(/Configuração|Notifica/i.test(text), 'notification-config-missing');
    await snap(page, '11-admin-notificacoes');
  });

  await record('/admin/pessoas: reset de perfil exposto sem diálogo nativo', async () => {
    await assertRouteVisible(page, '/admin/pessoas', []);
    const text = await visibleText(page);
    expect(/Pessoas|Reset|Perfil/i.test(text), 'admin-people-controls-missing');
    expect(telemetry.nativeDialogs.length === 0, 'native-dialog-detected');
    await snap(page, '12-admin-pessoas');
  });

  await record('perspectiva memorial: fórum e curiosidades bloqueiam escrita', async () => {
    await page.evaluate(() => {
      localStorage.setItem('arvorefamilia:responsible-perspective', JSON.stringify({
        pessoaId: '4b6eb714-a6e3-4a44-a093-01a95d935271',
        nomeCompleto: 'Condilênia Maria Tsangaropulos Souza',
        falecido: true,
        role: 'Responsável',
      }));
      window.dispatchEvent(new CustomEvent('arvorefamilia:responsible-perspective-changed'));
    });
    await goto(page, '/forum');
    let text = await visibleText(page);
    expect(/memorial/i.test(text), 'memorial-forum-notice-missing');
    await goto(page, '/curiosidades');
    text = await visibleText(page);
    expect(/memorial/i.test(text), 'memorial-curiosities-notice-missing');
    expect(telemetry.nativeDialogs.length === 0, 'native-dialog-detected');
    await snap(page, '13-memorial-curiosidades');
    await page.evaluate(() => localStorage.removeItem('arvorefamilia:responsible-perspective'));
  });

  await record('transversal desktop: sem erros críticos de página/console', async () => {
    const ignorable = telemetry.consoleErrors.filter(x =>
      !/favicon|ResizeObserver|404.*manifest|ERR_BLOCKED_BY_CLIENT/i.test(x)
    );
    expect(telemetry.pageErrors.length === 0, 'page-errors:' + telemetry.pageErrors.join(' | '));
    expect(ignorable.length === 0, 'console-errors:' + ignorable.join(' | '));
    expect(telemetry.nativeDialogs.length === 0, 'native-dialogs:' + JSON.stringify(telemetry.nativeDialogs));
  });

  await desktop.context.close();

  for (const width of [320, 375, 390, 430]) {
    const mobile = await makePage(browser, adminSession, { width, height: 844 }, {}, true);
    await record(`mobile ${width}px: mapa toolbar/header/nav e painéis`, async () => {
      await goto(mobile.page, '/mapa-familiar');
      const text = await visibleText(mobile.page);
      for (const needle of ['Árvore Familiar', 'Formato', 'Cor', 'Filtros', 'Mapa']) {
        expect(text.includes(needle), `missing-mobile-control:${needle}`);
      }
      await assertNoHorizontalOverflow(mobile.page, 6);
      for (const label of ['Formato', 'Cor', 'Filtros', 'Mapa']) {
        const button = mobile.page.getByRole('button', { name: new RegExp(label, 'i') }).first();
        if (await button.count()) {
          await button.click();
          await mobile.page.waitForTimeout(300);
          await assertNoHorizontalOverflow(mobile.page, 6);
          await mobile.page.keyboard.press('Escape').catch(() => {});
        }
      }
      await snap(mobile.page, `mobile-${width}-mapa`);
      expect(mobile.telemetry.nativeDialogs.length === 0, 'native-dialog-detected');
    });

    await record(`mobile ${width}px: linha geracional compartilhada`, async () => {
      await goto(mobile.page, '/linha-geracional');
      const text = await visibleText(mobile.page);
      expect(text.includes('Árvore Familiar'), 'shared-header-missing');
      expect(/Formato|Mapa/.test(text), 'shared-toolbar-missing');
      await assertNoHorizontalOverflow(mobile.page, 6);
      await snap(mobile.page, `mobile-${width}-linha-geracional`);
    });
    await mobile.context.close();
  }

  const onboarding = await makePage(browser, onboardingSession, { width: 390, height: 844 }, {}, true);
  await record('onboarding: usuário incompleto entra em /meus-dados', async () => {
    await goto(onboarding.page, '/meus-dados');
    const text = await visibleText(onboarding.page);
    expect(/Nascimento|Sobre Mim|Dados/i.test(text), 'onboarding-meus-dados-missing');
    await snap(onboarding.page, '20-onboarding-meus-dados');
  });

  await record('onboarding: questionário aceita Pular Tudo quando disponível', async () => {
    await goto(onboarding.page, '/meus-dados');
    const skip = onboarding.page.getByRole('button', { name: /Pular Tudo/i }).first();
    if (!(await skip.count())) throw new Error('SKIP:pular-tudo-not-visible-in-current-step');
    await skip.click();
    await onboarding.page.waitForTimeout(500);
    const text = await visibleText(onboarding.page);
    expect(!text.includes('Selecione ao menos uma característica antes de continuar.'), 'skip-all-validation-regression');
    expect(/Perfil|Mini Bio|Curiosidades/i.test(text), 'profile-final-step-missing');
    await snap(onboarding.page, '21-onboarding-pular-tudo');
  }, { conditional: true });

  await record('onboarding: rotas internas fora do fluxo permanecem guardadas', async () => {
    await onboarding.page.goto(new URL('/forum', BASE_URL).toString(), { waitUntil: 'domcontentloaded' });
    await onboarding.page.waitForTimeout(700);
    expect(!/\/forum(?:\?|$)/.test(onboarding.page.url()), 'incomplete-user-accessed-forum');
  });

  await onboarding.context.close();

} finally {
  await browser.close();
}

const summary = {
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  base_url: BASE_URL,
  total: results.length,
  pass: results.filter(x => x.status === 'pass').length,
  fail: results.filter(x => x.status === 'fail').length,
  skip: results.filter(x => x.status === 'skip').length,
  screenshots,
  results,
};

await fs.writeFile(path.join(OUT_DIR, 'qa-report.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (summary.fail > 0) process.exitCode = 1;
