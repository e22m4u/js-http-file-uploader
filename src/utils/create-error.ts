import {Constructor} from '../types.js';
import {format} from '@e22m4u/js-format';

/**
 * Create error.
 *
 * @param ctor
 * @param code
 * @param message
 * @param details
 * @param args
 */
export function createError<T extends object>(
  ctor: Constructor<T>,
  code: string,
  message: string,
  details?: unknown,
  ...args: unknown[]
): T {
  const msg = format(message, ...args);
  const error = new ctor(msg);
  Object.assign(error, {code, details});
  return error;
}
