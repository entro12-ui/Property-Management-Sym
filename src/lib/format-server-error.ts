import { Prisma } from '@prisma/client';

export type FormattedError = {
  title: string;
  message: string;
  hint?: string;
};

export class UserFacingError extends Error {
  readonly title: string;

  constructor(message: string, title = 'Request failed') {
    super(message);
    this.name = 'UserFacingError';
    this.title = title;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta ? JSON.stringify(error.meta) : '';
    return [error.message, meta].filter(Boolean).join(' ');
  }
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : error.cause != null
          ? String(error.cause)
          : '';
    return [error.message, cause].filter(Boolean).join(' — ');
  }
  return String(error ?? '');
}

function isConnectionIssue(lower: string): boolean {
  return (
    lower.includes("can't reach database") ||
    lower.includes('connection refused') ||
    lower.includes('connection timed out') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('p1001') ||
    lower.includes('p1002') ||
    lower.includes('p1017') ||
    lower.includes('server has closed the connection')
  );
}

function isSchemaIssue(lower: string): boolean {
  return (
    lower.includes('p2022') ||
    lower.includes('p2021') ||
    lower.includes('does not exist') ||
    lower.includes('unknown column') ||
    lower.includes('column') && lower.includes('not exist')
  );
}

export function formatServerError(error: unknown, pageName?: string): FormattedError {
  if (error instanceof UserFacingError) {
    return { title: error.title, message: error.message };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1017') {
      return {
        title: 'Database is waking up',
        message: 'The server could not connect to the database.',
        hint: 'On Render free tier, Postgres sleeps after inactivity. Wait about 30 seconds, then click Try again.',
      };
    }
    if (error.code === 'P2022') {
      const column = typeof error.meta?.column === 'string' ? error.meta.column : 'a required column';
      return {
        title: 'Database schema is out of date',
        message: `The database is missing ${column}. The app was updated but the database was not synced.`,
        hint: 'Redeploy the app (build runs db:sync) or run `npm run db:sync` against your production database.',
      };
    }
    if (error.code === 'P2021') {
      const table = typeof error.meta?.table === 'string' ? error.meta.table : 'a required table';
      return {
        title: 'Database schema is out of date',
        message: `The database is missing ${table}.`,
        hint: 'Redeploy the app or run `npm run db:sync` on the server.',
      };
    }
  }

  const msg = getErrorMessage(error);
  const lower = msg.toLowerCase();

  if (isConnectionIssue(lower)) {
    return {
      title: 'Database is waking up',
      message: 'The server could not reach the database.',
      hint: 'On Render free tier, Postgres sleeps after inactivity. Wait about 30 seconds, then click Try again.',
    };
  }

  if (isSchemaIssue(lower)) {
    return {
      title: 'Database schema is out of date',
      message: 'The database is missing columns or tables that this version of the app expects.',
      hint: 'Redeploy the app (build runs db:sync) or run `npm run db:sync` against your production database.',
    };
  }

  if (lower.includes('not authorized') || lower.includes('unauthorized') || lower.includes('forbidden')) {
    return {
      title: 'Access denied',
      message: msg || 'You do not have permission to view this page.',
    };
  }

  if (msg && msg.length > 0 && msg.length < 280 && !lower.includes('digest')) {
    return {
      title: pageName ? `Could not load ${pageName}` : 'Could not load page',
      message: msg,
    };
  }

  return {
    title: 'Something went wrong',
    message: pageName
      ? `An error occurred while loading ${pageName}.`
      : 'An error occurred while loading this page.',
    hint:
      'This often happens when the database is waking up (wait 30 seconds and retry) or after a deploy before the database schema was updated.',
  };
}

/** Full page reload — reliable retry for server component failures. */
export function reloadPage(): void {
  window.location.reload();
}
