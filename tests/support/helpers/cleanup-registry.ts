export type CleanupTask = () => void | Promise<void>;

export interface CleanupRegistry {
  register(task: CleanupTask): void;
  run(): Promise<void>;
  clear(): void;
  size(): number;
}

export function createCleanupRegistry(): CleanupRegistry {
  const tasks: CleanupTask[] = [];

  return {
    register(task: CleanupTask) {
      tasks.push(task);
    },
    async run() {
      const errors: unknown[] = [];

      while (tasks.length > 0) {
        const task = tasks.pop();
        if (!task) continue;

        try {
          await task();
        } catch (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        throw new AggregateError(errors, 'Una o más tareas de limpieza fallaron');
      }
    },
    clear() {
      tasks.length = 0;
    },
    size() {
      return tasks.length;
    },
  };
}
