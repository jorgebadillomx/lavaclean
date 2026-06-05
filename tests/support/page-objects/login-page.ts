import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get logo(): Locator {
    return this.page.getByLabel('Logo LavaClean');
  }

  get brand(): Locator {
    return this.page.getByText('LavaClean', { exact: true });
  }

  get subtitle(): Locator {
    return this.page.getByText('Sistema de Punto de Venta', { exact: true });
  }

  get initMessage(): Locator {
    return this.page.getByText('Iniciando LavaClean...', { exact: true });
  }

  get errorTitle(): Locator {
    return this.page.getByText('Error al iniciar', { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.brand).toBeVisible();
    await expect(this.subtitle).toBeVisible();
  }
}
