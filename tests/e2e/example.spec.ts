import { log } from '@seontechnologies/playwright-utils';
import { test, expect } from '../support/fixtures';
import { LoginPage } from '../support/page-objects/login-page';
import { createProductSeed, createSmokeScenario } from '../support/helpers/factories';

test('muestra un shell web con catálogo simulado', async ({ page, interceptNetworkCall, cleanupRegistry, smokeScenario }) => {
  const shell = createSmokeScenario({
    appName: smokeScenario.appName,
    subtitle: smokeScenario.subtitle,
  });
  const product = createProductSeed({
    name: 'Lavado Express',
    priceCents: 12_900,
  });
  const loginPage = new LoginPage(page);

  cleanupRegistry.register(async () => {
    await Promise.resolve();
  });

  const catalogCall = interceptNetworkCall({
    url: '**/api/catalog',
    fulfillResponse: {
      status: 200,
      body: {
        items: [product],
      },
    },
  });

  await log.step('Given un shell local con selectores estables');
  await page.setContent(`
    <!doctype html>
    <html lang="es">
      <body>
        <main>
          <div role="img" aria-label="Logo ${shell.appName}">
            <h1>${shell.appName}</h1>
          </div>
          <p>${shell.subtitle}</p>
          <section aria-label="Catálogo">
            <ul data-testid="catalog-list"></ul>
          </section>
        </main>
        <script>
          fetch('https://catalog.lavaclean.test/api/catalog')
            .then((response) => response.json())
            .then((data) => {
              const list = document.querySelector('[data-testid="catalog-list"]');
              list.innerHTML = data.items
                .map((item) => '<li data-testid="catalog-item">' + item.name + ' - $' + (item.priceCents / 100).toFixed(2) + '</li>')
                .join('');
            });
        </script>
      </body>
    </html>
  `);

  await log.step('When la página solicita el catálogo');
  const response = await catalogCall;

  await log.step('Then la UI renderiza el dato interceptado');
  await loginPage.expectLoaded();
  await expect(page.getByTestId('catalog-item')).toHaveText('Lavado Express - $129.00');
  await expect(page.getByTestId('catalog-list')).toContainText('Lavado Express');
  expect(response.status).toBe(200);
  expect(response.responseJson).toMatchObject({
    items: [
      {
        name: product.name,
      },
    ],
  });
});
