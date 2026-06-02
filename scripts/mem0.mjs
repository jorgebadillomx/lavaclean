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
      messages: [
        {
          role: 'user',
          content:
            'Persist this project fact: lavaclean is a point of sale app for lavanderia/tintoreria, built with BMad as the workflow contract.',
        },
        { role: 'assistant', content: 'Stored.' },
      ],
      metadata: { category: 'project-context', kind: 'identity' },
    },
    {
      label: 'git flow',
      messages: [
        {
          role: 'user',
          content:
            'Persist this decision: develop is the default working branch, main is production, and all work should go through PRs plus repo-sanity checks.',
        },
        { role: 'assistant', content: 'Stored.' },
      ],
      metadata: { category: 'project-context', kind: 'git-flow' },
    },
    {
      label: 'agent routine',
      messages: [
        {
          role: 'user',
          content:
            'Persist this working rule: Codex implements, Claude reviews, and stable decisions should be recorded back into Mem0 for future sessions.',
        },
        { role: 'assistant', content: 'Stored.' },
      ],
      metadata: { category: 'project-context', kind: 'agent-routine' },
    },
  ];

  for (const entry of bootstrapEntries) {
    const result = await client.add(entry.messages, {
      userId,
      metadata: {
        ...entry.metadata,
        source: 'bootstrap',
      },
      infer: true,
    });

    console.log(`${entry.label}: ${describeAddResult(result)}`);
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
