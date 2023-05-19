import * as typedoc from 'typedoc';

/**
 * Provides a basic plugin declaration for Typedoc.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
declare function load(app: typedoc.Application): void;

export { load };
