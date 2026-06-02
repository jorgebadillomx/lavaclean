import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MemoryClient } from 'mem0ai';

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getClient() {
  const projectRoot = process.cwd();
  loadDotEnv(resolve(projectRoot, '.env'));

  const mode = (process.env.MEM0_MODE || 'managed').toLowerCase();
  if (mode !== 'managed') {
    throw new Error(
      `MEM0_MODE must be "managed" for this setup. Current value: ${mode}`,
    );
  }

  const apiKey = process.env.MEM0_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('MEM0_API_KEY is missing. Set it in .env before running Mem0 commands.');
  }

  const host = process.env.MEM0_HOST?.trim() || 'https://api.mem0.ai';
  const userId = process.env.MEM0_USER_ID?.trim() || 'lavaclean-project';

  return {
    client: new MemoryClient({ apiKey, host }),
    userId,
  };
}

function parseQuery(argv) {
  const query = argv.slice(3).join(' ').trim();
  if (!query) {
    throw new Error('Provide a query after the command.');
  }

  return query;
}

function describeAddResult(result) {
  if (Array.isArray(result)) {
    return result.map((memory) => memory.id).join(', ');
  }

  if (result && typeof result === 'object') {
    const eventId = result.eventId || result.id || 'unknown';
    const status = result.status || 'unknown';
    return `eventId=${eventId} status=${status}`;
  }

  return String(result);
}

async function addProjectMemory(client, userId, entry) {
  const result = await client.add(
    [
      {
        role: 'user',
        content: entry.content,
      },
      {
        role: 'assistant',
        content: entry.confirmation || 'Registered.',
      },
    ],
    {
      userId,
      metadata: {
        category: 'project-context',
        source: entry.source || 'bootstrap',
        kind: entry.kind,
        title: entry.label,
        ...(entry.metadata || {}),
      },
      infer: true,
    },
  );

  console.log(`${entry.label}: ${describeAddResult(result)}`);
}

async function ping() {
  const { client } = getClient();
  await client.ping();
  console.log('Mem0 ping ok.');
}

async function seed() {
  const { client, userId } = getClient();
  await client.ping();

  const bootstrapEntries = [
    {
      label: 'project identity',
      content:
        'Persist this project fact: lavaclean is a point of sale app for lavanderia/tintoreria, built with BMad as the workflow contract.',
      kind: 'identity',
    },
    {
      label: 'git flow',
      content:
        'Persist this decision: develop is the default working branch, main is production, and all work should go through PRs plus repo-sanity checks.',
      kind: 'git-flow',
    },
    {
      label: 'agent routine',
      content:
        'Persist this working rule: Codex implements, Claude reviews, and stable decisions should be recorded back into Mem0 for future sessions.',
      kind: 'agent-routine',
    },
  ];

  for (const entry of bootstrapEntries) {
    await addProjectMemory(client, userId, {
      ...entry,
      source: 'bootstrap',
    });
  }
}

async function seedPlanning() {
  const { client, userId } = getClient();
  await client.ping();

  const planningEntries = [
    {
      label: 'product scope',
      kind: 'scope',
      content:
        'Persist this stable planning fact: Lavaclean is a point-of-sale app for lavanderia/tintoreria operations, with operator and administrator flows separated by role.',
    },
    {
      label: 'planning status',
      kind: 'status',
      content:
        'Persist this stable planning fact: PRD, UX, architecture, and epics are complete, and the project is marked ready for implementation.',
    },
    {
      label: 'fr and nfr count',
      kind: 'requirements',
      content:
        'Persist this stable planning fact: the product scope contains 25 functional requirements and 8 non-functional requirements, all covered by the epics and aligned with UX and architecture.',
    },
    {
      label: 'architecture stack',
      kind: 'architecture-stack',
      content:
        'Persist this stable planning fact: the implementation stack is Expo, React Native, TypeScript, EAS Build, Expo SQLite, Drizzle ORM, Supabase, Zustand, TanStack Query, and React Navigation 7.',
    },
    {
      label: 'offline-first data model',
      kind: 'data',
      content:
        'Persist this stable planning fact: offline-first is non-negotiable, SQLite is the local source of truth, and outbox sync to Supabase uses last-write-wins with server timestamps.',
    },
    {
      label: 'printing architecture',
      kind: 'printing',
      content:
        'Persist this stable planning fact: printing is non-blocking, ESC/POS payloads are generated in pure code, persisted with the note, and sent to RawBT via Android intent.',
    },
    {
      label: 'security and auth',
      kind: 'security',
      content:
        'Persist this stable planning fact: administrator auth is based on a hashed local config with SHA-256 plus ADMIN_SALT, and sensitive values must stay out of plain text source files.',
    },
    {
      label: 'git workflow',
      kind: 'git-flow',
      content:
        'Persist this stable planning fact: develop is the integration branch, main is production, feature branches carry one objective, and repo-sanity is the required quality check.',
    },
    {
      label: 'ux constraints',
      kind: 'ux',
      content:
        'Persist this stable planning fact: the UX is light-mode only in v1, the POS critical flow targets five taps or fewer, touch targets are at least 48dp, and tablet layout switches at 600dp.',
    },
    {
      label: 'epic roadmap',
      kind: 'roadmap',
      content:
        'Persist this stable planning fact: the epic order is foundation first, then auth and branch selection, products, shift and cash, POS notes and payment, printing, branch management, and admin history.',
    },
    {
      label: 'operational scale',
      kind: 'scale',
      content:
        'Persist this stable planning fact: there are five branches in operation from the start, and the main resource risk on Supabase is bandwidth rather than storage.',
    },
    {
      label: 'collaboration rule',
      kind: 'process',
      content:
        'Persist this stable planning fact: Codex implements changes, Claude reviews them, and stable decisions can be recorded back into Mem0 for future sessions.',
    },
  ];

  for (const entry of planningEntries) {
    await addProjectMemory(client, userId, {
      ...entry,
      source: 'planning-seed',
    });
  }
}

async function search() {
  const query = parseQuery(process.argv);
  const { client, userId } = getClient();
  await client.ping();

  const result = await client.search(query, {
    filters: { user_id: userId },
    topK: 5,
  });

  if (!result.results.length) {
    console.log('No memories found.');
    return;
  }

  for (const memory of result.results) {
    console.log(`- ${memory.memory ?? '(no text)'} [${memory.id}]`);
  }
}

async function remember() {
  const note = parseQuery(process.argv);
  const { client, userId } = getClient();
  await client.ping();

  const result = await client.add(
    [
      {
        role: 'user',
        content: note,
      },
    ],
    {
      userId,
      metadata: {
        category: 'manual-note',
        source: 'cli',
      },
      infer: true,
    },
  );

  console.log(`Stored memory result: ${describeAddResult(result)}`);
}

async function main() {
  const command = (process.argv[2] || 'ping').toLowerCase();

  switch (command) {
    case 'ping':
      await ping();
      return;
    case 'seed':
      await seed();
      return;
    case 'seed-planning':
      await seedPlanning();
      return;
    case 'search':
      await search();
      return;
    case 'remember':
      await remember();
      return;
    default:
      throw new Error(`Unknown Mem0 command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
