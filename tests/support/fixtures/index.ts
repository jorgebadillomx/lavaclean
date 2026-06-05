import { mergeTests, expect as baseExpect, test as baseTest } from '@playwright/test';
import { test as apiRequestFixture } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures';
import { test as interceptNetworkCallFixture } from '@seontechnologies/playwright-utils/intercept-network-call/fixtures';
import { test as networkErrorMonitorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures';
import { createCleanupRegistry, type CleanupRegistry } from '../helpers/cleanup-registry';
import { createSmokeScenario, createTestOperator, type SmokeScenario } from '../helpers/factories';

type ProjectFixtures = {
  cleanupRegistry: CleanupRegistry;
  smokeScenario: SmokeScenario;
};

const projectFixture = baseTest.extend<ProjectFixtures>({
  cleanupRegistry: [
    async ({}, use) => {
      const registry = createCleanupRegistry();
      await use(registry);
      await registry.run();
    },
    { auto: true },
  ],
  smokeScenario: [
    async ({}, use, testInfo) => {
      await use(
        createSmokeScenario({
          operator: createTestOperator({ name: testInfo.title }),
        }),
      );
    },
    { auto: true },
  ],
});

export const test = mergeTests(
  apiRequestFixture,
  recurseFixture,
  interceptNetworkCallFixture,
  networkErrorMonitorFixture,
  projectFixture,
);

export const expect = baseExpect;
