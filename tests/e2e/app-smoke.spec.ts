import { expect, test } from '@playwright/test';

test('pagina inicial redireciona visitante sem sessao para login', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('login exibe formulario', async ({ page }) => {
  await page.goto('/entrar');

  await expect(page.getByTestId('login-form')).toBeVisible();
  await expect(page.getByTestId('login-email')).toBeVisible();
  await expect(page.getByTestId('login-password')).toBeVisible();
  await expect(page.getByTestId('login-submit')).toBeVisible();
});

test('rota protegida principal da arvore bloqueia usuario nao autenticado', async ({ page }) => {
  await page.goto('/mapa-familiar');

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('rota protegida horizontal da arvore bloqueia usuario nao autenticado', async ({ page }) => {
  await page.goto('/mapa-familiar-horizontal');

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('rotas antigas de views da arvore nao devem voltar como rotas ativas', async ({ page }) => {
  const legacyRoutes = ['/minha-arvore', '/genealogia', '/visao-completa'];

  for (const legacyRoute of legacyRoutes) {
    await page.goto(legacyRoute);

    await expect(page.locator('body')).toContainText(/404|Página não encontrada/i);
    await expect(page).toHaveURL(new RegExp(`${legacyRoute}$`));
  }
});

test('rota vigente de edicao minha-arvore continua protegida', async ({ page }) => {
  await page.goto('/minha-arvore/editar');

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('perfil de pessoa nao quebra sem sessao e redireciona para login', async ({ page }) => {
  const personId = process.env.E2E_PUBLIC_PERSON_ID || '00000000-0000-4000-8000-000000000000';
  await page.goto(`/pessoa/${personId}`);

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('alias /pessoas/:id tambem exige login', async ({ page }) => {
  const personId = process.env.E2E_PUBLIC_PERSON_ID || '00000000-0000-4000-8000-000000000000';
  await page.goto(`/pessoas/${personId}`);

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});

test('admin bloqueia usuario nao autenticado', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});
