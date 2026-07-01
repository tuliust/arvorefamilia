const { chromium, devices } = require('playwright');

const BASE_URL = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.VERIFY_EMAIL || 'tuliust@gmail.com';
const PASSWORD = process.env.VERIFY_PASSWORD || 'Populos@2026';

const DEVICE = devices['iPhone 13'];

const SELECTORS = {
  toolbar: '[data-mobile-family-map-toolbar="true"]',
  backdrop: '#mobile-map-toolbar-panel-backdrop',
  generationOverlay: '#mobile-generation-safe-overview-overlay',
  familyInlineOverview: '[data-mobile-family-map-inline-overview="true"]',
  familyFullMap: '#mobile-family-map-full-overview',
  generationFullMap: '#mobile-generation-line-full-overview',
  familyFullViewport: '#mobile-family-map-full-overview .mobile-family-full-map-viewport',
  familyFullStage: '#mobile-family-map-full-overview .mobile-family-full-map-stage',
  generationFullViewport: '#mobile-generation-line-full-overview .mobile-generation-line-full-map-viewport',
  generationFullStage: '#mobile-generation-line-full-overview .mobile-generation-line-full-map-stage',
};

function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function ensureTmpDir() {
  const fs = require('fs');
  if (!fs.existsSync('.tmp')) fs.mkdirSync('.tmp', { recursive: true });
}

async function maybeLogin(page) {
  await page.goto(`${BASE_URL}/mapa-familiar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const hasEmailInput = await page.locator('input[type="email"], input[name*="email" i], input[autocomplete="email"]').count();
  const bodyText = normalize(await page.locator('body').innerText().catch(() => ''));

  if (!hasEmailInput && !bodyText.includes('entrar') && !bodyText.includes('login') && !bodyText.includes('email')) {
    return;
  }

  const emailInput = page.locator('input[type="email"], input[name*="email" i], input[autocomplete="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name*="password" i], input[autocomplete="current-password"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(EMAIL);
  await passwordInput.fill(PASSWORD);

  const submit = page.locator('button[type="submit"], button').filter({
    hasText: /entrar|login|acessar|continuar/i,
  }).first();

  await submit.click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);
}

async function clickButtonByText(page, text) {
  const button = page.locator('button').filter({ hasText: text }).first();
  await button.waitFor({ state: 'visible', timeout: 15000 });
  await button.click();
  await page.waitForTimeout(700);
}

async function getRect(page, selector) {
  return page.locator(selector).first().evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  });
}

async function getStyle(page, selector) {
  return page.locator(selector).first().evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      zIndex: style.zIndex,
      position: style.position,
      top: style.top,
      bottom: style.bottom,
      backgroundColor: style.backgroundColor,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || '',
      filter: style.filter,
      pointerEvents: style.pointerEvents,
      transform: style.transform,
      visibility: style.visibility,
      opacity: style.opacity,
    };
  });
}

async function findBottomNavRect(page) {
  const result = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('nav, [role="navigation"], footer'));
    const found = candidates
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        return {
          text,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width,
        };
      })
      .filter((item) => (
        item.height >= 48 &&
        item.top > window.innerHeight * 0.45 &&
        /Home/i.test(item.text) &&
        /Calend/i.test(item.text) &&
        /F[oó]rum/i.test(item.text)
      ))
      .sort((a, b) => b.top - a.top)[0];

    return found || null;
  });

  return result;
}

async function assertBackdropBasic(page, label) {
  const backdrop = page.locator(SELECTORS.backdrop);
  await backdrop.waitFor({ state: 'visible', timeout: 8000 });

  const backdropRect = await getRect(page, SELECTORS.backdrop);
  const toolbarRect = await getRect(page, SELECTORS.toolbar);
  const backdropStyle = await getStyle(page, SELECTORS.backdrop);
  const bottomNavRect = await findBottomNavRect(page);

  if (backdropRect.top <= toolbarRect.bottom - 4) {
    throw new Error(`${label}: blur está começando em cima da toolbar. backdrop.top=${backdropRect.top}, toolbar.bottom=${toolbarRect.bottom}`);
  }

  if (bottomNavRect && backdropRect.bottom > bottomNavRect.top + 3) {
    throw new Error(`${label}: blur está invadindo o menu inferior. backdrop.bottom=${backdropRect.bottom}, bottomNav.top=${bottomNavRect.top}`);
  }

  if (!backdropStyle.backdropFilter || backdropStyle.backdropFilter === 'none') {
    throw new Error(`${label}: backdrop sem blur/backdrop-filter ativo.`);
  }

  if (!/rgba?\(/i.test(backdropStyle.backgroundColor)) {
    throw new Error(`${label}: backdrop sem background translúcido escuro. background=${backdropStyle.backgroundColor}`);
  }

  if (backdropStyle.pointerEvents !== 'none') {
    throw new Error(`${label}: backdrop deveria ter pointer-events:none. atual=${backdropStyle.pointerEvents}`);
  }

  return { backdropRect, toolbarRect, bottomNavRect, backdropStyle };
}

async function assertBackdropBelowPanel(page, label, panelSelector) {
  await assertBackdropBasic(page, label);

  const backdropRect = await getRect(page, SELECTORS.backdrop);
  const panel = page.locator(panelSelector).first();
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  const panelRect = await getRect(page, panelSelector);

  if (backdropRect.top < panelRect.bottom - 6) {
    throw new Error(`${label}: blur está por cima do painel ativo. backdrop.top=${backdropRect.top}, panel.bottom=${panelRect.bottom}, selector=${panelSelector}`);
  }
}

async function assertHeaderToolbarNormal(page, label) {
  const toolbarStyle = await getStyle(page, SELECTORS.toolbar);
  const toolbarRect = await getRect(page, SELECTORS.toolbar);

  if (toolbarRect.top < 80 || toolbarRect.top > 360) {
    throw new Error(`${label}: toolbar parece fora da posição esperada. top=${toolbarRect.top}, bottom=${toolbarRect.bottom}`);
  }

  if (toolbarStyle.filter && toolbarStyle.filter !== 'none') {
    throw new Error(`${label}: toolbar recebeu filter indevido. filter=${toolbarStyle.filter}`);
  }

  const title = page.locator('text=Árvore Familiar').first();
  await title.waitFor({ state: 'visible', timeout: 8000 });
  const titleStyle = await title.evaluate((el) => {
    const style = getComputedStyle(el);
    return { filter: style.filter, opacity: style.opacity };
  });

  if (titleStyle.filter && titleStyle.filter !== 'none') {
    throw new Error(`${label}: header/título recebeu filter indevido. filter=${titleStyle.filter}`);
  }
}

async function testBlurForRoute(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1600);

  await assertHeaderToolbarNormal(page, `${route} inicial`);

  await clickButtonByText(page, 'Cor');
  await assertHeaderToolbarNormal(page, `${route} / Cor`);
  await assertBackdropBasic(page, `${route} / Cor`);
  await page.screenshot({ path: `.tmp/${route.replace(/\//g, '')}-cor-blur.png`, fullPage: false });

  await clickButtonByText(page, 'Filtros');
  await assertHeaderToolbarNormal(page, `${route} / Filtros`);
  await assertBackdropBelowPanel(page, `${route} / Filtros`, '[role="dialog"][aria-label="Filtros do mapa familiar"]');
  await page.screenshot({ path: `.tmp/${route.replace(/\//g, '')}-filtros-blur.png`, fullPage: false });

  await clickButtonByText(page, 'Formato');
  await assertHeaderToolbarNormal(page, `${route} / Formato`);
  await assertBackdropBasic(page, `${route} / Formato`);
  await page.screenshot({ path: `.tmp/${route.replace(/\//g, '')}-formato-blur.png`, fullPage: false });

  await clickButtonByText(page, 'Mapa');
  await assertHeaderToolbarNormal(page, `${route} / Mapa`);

  if (route === '/linha-geracional') {
    await page.locator(SELECTORS.generationOverlay).waitFor({ state: 'visible', timeout: 8000 });
    await assertBackdropBelowPanel(page, `${route} / Mapa`, SELECTORS.generationOverlay);
  } else {
    await page.locator(SELECTORS.familyInlineOverview).waitFor({ state: 'visible', timeout: 8000 });
    await assertBackdropBelowPanel(page, `${route} / Mapa`, SELECTORS.familyInlineOverview);
  }

  await page.screenshot({ path: `.tmp/${route.replace(/\//g, '')}-mapa-blur.png`, fullPage: false });
}

async function getTransform(page, selector) {
  return page.locator(selector).first().evaluate((el) => getComputedStyle(el).transform);
}

function parseTransform(transform) {
  if (!transform || transform === 'none') {
    return { scale: 1, x: 0, y: 0, raw: transform };
  }

  const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3d) {
    const parts = matrix3d[1].split(',').map((value) => Number.parseFloat(value.trim()));
    return {
      scale: parts[0] || 1,
      x: parts[12] || 0,
      y: parts[13] || 0,
      raw: transform,
    };
  }

  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (matrix) {
    const parts = matrix[1].split(',').map((value) => Number.parseFloat(value.trim()));
    return {
      scale: parts[0] || 1,
      x: parts[4] || 0,
      y: parts[5] || 0,
      raw: transform,
    };
  }

  const translateScale = transform.match(/translate3d\((-?[0-9.]+)px,\s*(-?[0-9.]+)px,[^)]+\)\s*scale\((-?[0-9.]+)\)/);
  if (translateScale) {
    return {
      x: Number.parseFloat(translateScale[1]),
      y: Number.parseFloat(translateScale[2]),
      scale: Number.parseFloat(translateScale[3]),
      raw: transform,
    };
  }

  return { scale: 1, x: 0, y: 0, raw: transform };
}

async function touchPinch(page, box) {
  const client = await page.context().newCDPSession(page);
  const centerX = Math.round(box.x + box.width / 2);
  const centerY = Math.round(box.y + box.height / 2);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: centerX - 34, y: centerY, id: 1 },
      { x: centerX + 34, y: centerY, id: 2 },
    ],
  });

  await page.waitForTimeout(80);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: centerX - 96, y: centerY - 24, id: 1 },
      { x: centerX + 96, y: centerY + 24, id: 2 },
    ],
  });

  await page.waitForTimeout(120);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });

  await page.waitForTimeout(450);
}

async function touchPan(page, box) {
  const client = await page.context().newCDPSession(page);
  const startX = Math.round(box.x + box.width / 2);
  const startY = Math.round(box.y + box.height / 2);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: startX, y: startY, id: 3 }],
  });

  await page.waitForTimeout(80);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: startX + 56, y: startY + 48, id: 3 }],
  });

  await page.waitForTimeout(120);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });

  await page.waitForTimeout(450);
}

async function assertZoomAndPan(page, label, viewportSelector, stageSelector) {
  const viewport = page.locator(viewportSelector).first();
  const stage = page.locator(stageSelector).first();

  await viewport.waitFor({ state: 'visible', timeout: 12000 });
  await stage.waitFor({ state: 'visible', timeout: 12000 });

  const box = await viewport.boundingBox();
  if (!box) throw new Error(`${label}: viewport sem boundingBox.`);

  const beforeRaw = await getTransform(page, stageSelector);
  const before = parseTransform(beforeRaw);

  await touchPinch(page, box);

  const afterPinchRaw = await getTransform(page, stageSelector);
  const afterPinch = parseTransform(afterPinchRaw);

  if (afterPinch.raw === before.raw || Math.abs(afterPinch.scale - before.scale) < 0.02) {
    throw new Error(`${label}: zoom por pinça não alterou o transform. before=${before.raw}, after=${afterPinch.raw}`);
  }

  await page.waitForTimeout(1800);

  const afterWaitRaw = await getTransform(page, stageSelector);
  const afterWait = parseTransform(afterWaitRaw);

  if (Math.abs(afterWait.scale - afterPinch.scale) > 0.03) {
    throw new Error(`${label}: zoom retornou automaticamente ao enquadramento inicial. afterPinch=${afterPinch.raw}, afterWait=${afterWait.raw}`);
  }

  await touchPan(page, box);

  const afterPanRaw = await getTransform(page, stageSelector);
  const afterPan = parseTransform(afterPanRaw);

  const moved = Math.abs(afterPan.x - afterWait.x) > 8 || Math.abs(afterPan.y - afterWait.y) > 8;

  if (!moved) {
    throw new Error(`${label}: pan/movimentação não alterou posição. beforePan=${afterWait.raw}, afterPan=${afterPan.raw}`);
  }

  await page.waitForTimeout(1200);

  const afterPanWaitRaw = await getTransform(page, stageSelector);
  const afterPanWait = parseTransform(afterPanWaitRaw);

  if (Math.abs(afterPanWait.x - afterPan.x) > 8 || Math.abs(afterPanWait.y - afterPan.y) > 8) {
    throw new Error(`${label}: pan retornou automaticamente. afterPan=${afterPan.raw}, afterPanWait=${afterPanWait.raw}`);
  }
}

async function openFullMap(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1600);

  await clickButtonByText(page, 'Mapa');
  await page.waitForTimeout(900);

  const cta = page.locator('button').filter({ hasText: /Exibir (visualização|mapa) completa/i }).first();
  await cta.waitFor({ state: 'visible', timeout: 12000 });
  await cta.click();

  await page.waitForTimeout(2600);
}

async function testFullMapGestures(page, route) {
  await openFullMap(page, route);

  if (route === '/mapa-familiar') {
    await page.locator(SELECTORS.familyFullMap).waitFor({ state: 'visible', timeout: 12000 });
    await page.screenshot({ path: `.tmp/mapa-familiar-full-before-gesture.png`, fullPage: false });
    await assertZoomAndPan(
      page,
      `${route} / mapa completo`,
      SELECTORS.familyFullViewport,
      SELECTORS.familyFullStage
    );
    await page.screenshot({ path: `.tmp/mapa-familiar-full-after-gesture.png`, fullPage: false });
  }

  if (route === '/linha-geracional') {
    await page.locator(SELECTORS.generationFullMap).waitFor({ state: 'visible', timeout: 12000 });
    await page.screenshot({ path: `.tmp/linha-geracional-full-before-gesture.png`, fullPage: false });
    await assertZoomAndPan(
      page,
      `${route} / visualização completa`,
      SELECTORS.generationFullViewport,
      SELECTORS.generationFullStage
    );
    await page.screenshot({ path: `.tmp/linha-geracional-full-after-gesture.png`, fullPage: false });
  }
}

async function main() {
  await ensureTmpDir();

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
  });

  const context = await browser.newContext({
    ...DEVICE,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (['error', 'warning'].includes(type)) {
      console.log(`[browser:${type}] ${text}`);
    }
  });

  page.on('pageerror', (error) => {
    console.log(`[pageerror] ${error.message}`);
  });

  await maybeLogin(page);

  const results = [];

  for (const test of [
    async () => testBlurForRoute(page, '/mapa-familiar'),
    async () => testBlurForRoute(page, '/linha-geracional'),
    async () => testFullMapGestures(page, '/mapa-familiar'),
    async () => testFullMapGestures(page, '/linha-geracional'),
  ]) {
    try {
      await test();
      results.push({ ok: true, name: test.name || 'anonymous' });
    } catch (error) {
      results.push({ ok: false, name: test.name || 'anonymous', error: error.message });
      console.error(error);
    }
  }

  await page.screenshot({ path: '.tmp/final-state.png', fullPage: false });

  const failed = results.filter((item) => !item.ok);
  console.log('\nRESULTADOS');
  console.table(results);

  await browser.close();

  if (failed.length > 0) {
    console.error('\nFALHAS ENCONTRADAS:');
    failed.forEach((item) => console.error(`- ${item.error}`));
    process.exit(1);
  }

  console.log('\nOK: blur, camadas, zoom e pan passaram nas verificações automatizadas.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
