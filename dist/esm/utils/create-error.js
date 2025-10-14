import { format } from '@e22m4u/js-format';
/**
 * Create error.
 *
 * @param ctor
 * @param code
 * @param message
 * @param details
 * @param args
 */
export function createError(ctor, code, message, details, ...args) {
    const msg = format(message, ...args);
    const error = new ctor(msg);
    Object.assign(error, { code, details });
    return error;
}
