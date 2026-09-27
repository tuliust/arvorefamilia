import { expect, test } from '@playwright/test';

test('rotas publicas essenciais carregam sem sessao', async ({ page }) => {
  const routes = [
    { path: '/termos', heading: 'Termos de Uso' },
    { path: '/privacidade', heading: 'Política de Privacidade' },
    { path: '/duvidas', heading: 'Como podemos ajudar?' },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveURL(new RegExp(`${route.path}$`));
    await expect(page.getByRole('heading', { name: route.heading, level: 1 })).toBeVisible();
    await expect(page.getByText('Não foi possível carregar esta página')).toHaveCount(0);
  }
});

test('rota inexistente exibe 404 controlado', async ({ page }) => {
  await page.goto('/rota-que-nao-existe');

  await expect(page).toHaveURL(/\/rota-que-nao-existe$/);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByText('Página não encontrada')).toBeVisible();
});
