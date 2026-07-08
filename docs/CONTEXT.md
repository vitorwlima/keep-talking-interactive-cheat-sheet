# Project context (for humans and agents)

Interactive cheat sheet for **Keep Talking and Nobody Explodes** (pt-BR).
All rules come from the official manual:
https://www.bombmanual.com/pt-BR/print/KeepTalkingAndNobodyExplodes-BombDefusalManual-v2-pt-BR.pdf

## Stack

Deliberately **no build step**. Plain static files that open by double-clicking
`index.html` (works over `file://`) or from any static host. No frameworks, no
bundler, no dependencies. Classic `<script>` tags only (no ES modules / `fetch`,
which `file://` blocks).

```
index.html                 shell: header + tab bar + panel container, loads scripts
styles.css                 design tokens (light/dark) + shared + per-module styles
app.js                     builds tabs from the module registry, mounts each module
modules/<id>.js            one self-contained module each (self-registers)
docs/                      this file + one rules doc per module
```

## How the module system works

Each module file pushes a descriptor onto a global registry:

```js
window.CHEATSHEET_MODULES = window.CHEATSHEET_MODULES || [];
window.CHEATSHEET_MODULES.push({
  id:       'passwords',          // unique slug (used for element ids)
  name:     'Senhas',             // tab label
  color:    'var(--blue)',        // accent dot on the tab (optional)
  title:    'Senhas',             // <h1> shown when the tab is active
  subtitle: '…',                  // sub line under the <h1>
  mount(root){ /* inject HTML into root, wire up JS */ }
});
```

`app.js` reads the registry in load order, renders a tab + a hidden panel per
module, and calls `mount(panel)` once. The first tab is shown on load. Modules
are mounted eagerly (cheap) and just toggled with `hidden`.

### Adding a new module

1. Create `modules/<id>.js` following the pattern above. Keep all state and
   DOM queries scoped to the `root` passed to `mount` (use `root.querySelector`,
   not `document.querySelector`, for anything inside the panel).
2. Add `<script src="modules/<id>.js"></script>` to `index.html` **before**
   `app.js`.
3. Add shared/module CSS to `styles.css`. Reuse existing tokens
   (`--surface`, `--ink`, `--accent`, `--red`, `--blue`, `--green`, `--gold`,
   `--violet`, `--shadow`) so it themes automatically. Reuse `.layout`,
   `.controls`, `.field`, `.answer`/`.glyph` for a consistent look.
4. Document the rules in `docs/<id>.md`.

## Conventions

- Language is pt-BR (labels, instructions).
- Light + dark themes are driven by CSS custom properties in `:root`. The app
  also honors a `data-theme` attribute on `<html>` if a host sets one.
- The `.answer` card (colored glyph + verb + instruction) is the shared idiom
  for "here is what to do" — prefer it for a module's primary output.

## Modules implemented

- `complicated-wires` — Fios Complicados. See [complicated-wires.md](complicated-wires.md).
- `passwords` — Senhas. See [passwords.md](passwords.md).
