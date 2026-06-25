import { BadRequestException } from '@nestjs/common';

export interface PageInput {
  cursor?: string;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PageCursor {
  createdAt: string;
  id: string;
}

export function pageLimit(limit?: number): number {
  return Math.min(Math.max(limit ?? 25, 1), 100);
}

export function encodeCursor(cursor: PageCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string): PageCursor | undefined {
  if (!cursor) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as PageCursor;
    if (!parsed.createdAt || !parsed.id) {
      throw new Error('missing cursor fields');
    }
    return parsed;
  } catch {
    throw new BadRequestException('INVALID_CURSOR');
  }
}
