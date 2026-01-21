import type { Plugin } from 'vite';

/**
 * Vite plugin to normalize Tailwind CSS for Shadow DOM usage.
 *
 * Fixes:
 * - Removes `-webkit-hyphens: none` from @supports conditions (doesn't work in Shadow DOM)
 * - Converts `:root` to `:host` for proper Shadow DOM scoping
 *
 * @see https://github.com/tailwindlabs/tailwindcss/issues/15005
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import tailwindShadowDOM from 'vite-plugin-tailwind-shadowdom';
 *
 * export default defineConfig({
 *   plugins: [tailwindShadowDOM()],
 * });
 * ```
 */
export function tailwindShadowDOM(): Plugin {
  return {
    name: 'vite-plugin-tailwind-shadowdom',
    enforce: 'post', // Run after Tailwind processes CSS

    transform(code, id) {
      // Only process CSS files imported with ?inline (for Shadow DOM injection)
      if (!id.endsWith('.css?inline') && !id.includes('.css?')) {
        return null;
      }

      const transformed = code
        // Remove -webkit-hyphens:none conditions (with or without spaces)
        .replace(/\(\(-webkit-hyphens:\s*none\)\)\s*and\s*/g, '')
        .replace(/\(-webkit-hyphens:\s*none\)\s*and\s*/g, '')
        // Convert :root to :host for Shadow DOM
        .replace(/:root\b/g, ':host');

      if (transformed !== code) {
        return {
          code: transformed,
          map: null,
        };
      }

      return null;
    },
  };
}

export default tailwindShadowDOM;
