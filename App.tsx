import * as Sentry from '@sentry/react-native';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';

const sentryDsn = (process.env.EXPO_PUBLIC_SENTRY_DSN ?? '').trim();

function stripAdminKeys(value: unknown, seen = new WeakSet()): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripAdminKeys(item, seen));
  }

  if (value && typeof value === 'object') {
    // Preserve non-plain objects (Date, Error, RegExp, etc.) intact
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      return value;
    }
    // Circular reference guard
    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.toLowerCase().includes('admin'))
        .map(([key, nestedValue]) => [key, stripAdminKeys(nestedValue, seen)]),
    );
  }

  return value;
}

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0,
    beforeSend(event) {
      // NFR-7: no enviar campos cuyo nombre incluya "admin".
      return stripAdminKeys(event) as typeof event;
    },
  });
}

function App() {
  return <RootNavigator />;
}

export default Sentry.wrap(App);
