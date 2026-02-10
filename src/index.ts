import type { Plugin } from 'vite';

/**
 * Vite plugin to normalize Tailwind CSS for Shadow DOM usage.
 *
 * Fixes:
 * - Removes `-webkit-hyphens: none` from @supports conditions (doesn't work in Shadow DOM)
 * - Removes problematic @supports wrapper while keeping content (prevents blocking properties in Shadow DOM)
 * - Converts `:root` to `:host` for proper Shadow DOM scoping
 *
 * @see https://github.com/tailwindlabs/tailwindcss/issues/15005
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

      let transformed = code;

      // Remove problematic @supports wrapper while keeping its content
      // This prevents the @supports condition from blocking properties in Shadow DOM
      // Matches any @supports block containing -webkit-hyphens (works for multiple support statements)
      const supportsPattern = /@supports\s+[^{]*-webkit-hyphens[^{]*\{/g;

      // Collect all matches first, then process to avoid offset issues
      const matches: Array<{
        start: number;
        end: number;
        contentStart: number;
        contentEnd: number;
      }> = [];
      const pattern = new RegExp(supportsPattern);
      let match = pattern.exec(transformed);

      while (match !== null) {
        // The opening brace is at the end of the match, content starts right after it
        const contentStart = match.index + match[0].length;
        // Find the matching closing brace by counting nested braces
        let braceCount = 1;
        let i = contentStart;
        while (i < transformed.length && braceCount > 0) {
          if (transformed[i] === '{') {
            braceCount += 1;
          }
          if (transformed[i] === '}') {
            braceCount -= 1;
            if (braceCount === 0) {
              matches.push({
                start: match.index,
                end: i + 1,
                contentStart,
                contentEnd: i,
              });
              break;
            }
          }
          i += 1;
        }
        match = pattern.exec(transformed);
      }

      // Process matches from end to start to avoid offset issues
      if (matches.length > 0) {
        let result = '';
        let lastIndex = 0;
        for (const m of matches) {
          // Add content before the match
          result += transformed.substring(lastIndex, m.start);
          // Add content inside the @supports block (without the wrapper)
          result += transformed.substring(m.contentStart, m.contentEnd);
          lastIndex = m.end;
        }
        // Add remaining content after last match
        result += transformed.substring(lastIndex);
        transformed = result;
      }

      transformed = transformed
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
