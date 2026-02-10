# vite-plugin-tailwind-shadowdom

A Vite plugin that normalizes Tailwind CSS for Shadow DOM usage.

## The Problem

When using Tailwind CSS inside Shadow DOM (web components), two issues occur:

1. **`:root` doesn't work** - CSS custom properties defined on `:root` aren't accessible inside Shadow DOM
2. **`-webkit-hyphens: none` breaks** - Tailwind's `@supports` conditions with `-webkit-hyphens: none` don't work properly in Shadow DOM context

See [tailwindlabs/tailwindcss#15005](https://github.com/tailwindlabs/tailwindcss/issues/15005) for more details.

## Installation

```bash
npm install vite-plugin-tailwind-shadowdom -D
# or
yarn add vite-plugin-tailwind-shadowdom -D
# or
pnpm add vite-plugin-tailwind-shadowdom -D
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindShadowDOM from 'vite-plugin-tailwind-shadowdom';

export default defineConfig({
  plugins: [tailwindShadowDOM()],
});
```

## What It Does

This plugin runs **after** Tailwind processes your CSS. It only transforms CSS that is imported with a query (e.g. `?inline`), which is the typical pattern for injecting styles into Shadow DOM.

1. **Unwraps problematic `@supports` blocks** – For any `@supports` that mentions `-webkit-hyphens`, the plugin removes the wrapper and keeps only the rules inside, so they always apply. That avoids the condition failing in Shadow DOM and blocking those styles.
2. **Converts `:root` to `:host`** – Ensures CSS custom properties and root-level styles apply to the Shadow DOM host.

### Before

```css
:root {
  --color-primary: #3b82f6;
}

@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) {
  .truncate {
    text-overflow: ellipsis;
  }
}
```

### After

```css
:host {
  --color-primary: #3b82f6;
}

.truncate {
  text-overflow: ellipsis;
}
```

## When to Use

This plugin is useful when:

- Building web components with Shadow DOM
- Embedding widgets/microfrontends that use Shadow DOM isolation
- Using Tailwind CSS with `?inline` (or other query) CSS imports for Shadow DOM injection

**Note:** The plugin only transforms CSS modules that are requested with a query (e.g. `import styles from './styles.css?inline'`). Regular CSS in your app is left unchanged.

## Compatibility

- Vite 4.x, 5.x, 6.x, 7.x
- Tailwind CSS 3.x, 4.x

## License

MIT © [Maximilian Förster](https://github.com/Alletkla)
