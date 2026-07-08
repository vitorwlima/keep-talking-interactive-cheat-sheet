# keep-talking-interactive-cheat-sheet

Interactive cheat sheet for **Keep Talking and Nobody Explodes** (pt-BR),
based on the [official bomb defusal manual](https://www.bombmanual.com/pt-BR/print/KeepTalkingAndNobodyExplodes-BombDefusalManual-v2-pt-BR.pdf).

One tab per module:

- **Fios Complicados** — describe a wire's traits (red/blue/★/LED); get the cut instruction, with an interactive Venn diagram.
- **Senhas** — type the letters available in each of the 5 positions; the tool filters to the matching password.

## Run it

No build step, no dependencies. Just open `index.html` in a browser (double-click
works), or serve the folder with any static server.

## Extending it

Each module is a self-contained file in `modules/` that registers itself with the
shell. See **[docs/CONTEXT.md](docs/CONTEXT.md)** for the architecture and how to
add a new module, and `docs/<module>.md` for each module's rules.
