# Fios Complicados (Complicated Wires) — rules

Manual section: **"A Respeito dos Fios Complicados"** (pt-BR v2).

Each wire may have any combination of four traits:

- **Vermelho** — the wire has red coloring
- **Azul** — the wire has blue coloring
- **★ (símbolo)** — a star symbol is printed by the wire
- **LED** — the LED above the wire is lit

The trait combination maps to one instruction. Instruction letters:

| Letter | Meaning |
|--------|---------|
| **C** | Corte o fio (cut) |
| **N** | Não corte o fio (do not cut) |
| **S** | Corte se o último dígito do número de série for par (serial ends even) |
| **P** | Corte se a bomba tem uma entrada paralela (has a parallel port) |
| **B** | Corte se a bomba tem duas ou mais pilhas (2+ batteries) |

## Full truth table

Key is `red blue star led` as 1/0 bits (matches `MAP` in `modules/complicated-wires.js`).

| Red | Blue | ★ | LED | Instruction |
|-----|------|---|-----|-------------|
| 0 | 0 | 0 | 0 | C |
| 1 | 0 | 0 | 0 | S |
| 0 | 1 | 0 | 0 | S |
| 0 | 0 | 1 | 0 | C |
| 0 | 0 | 0 | 1 | N |
| 1 | 1 | 0 | 0 | S |
| 1 | 0 | 1 | 0 | C |
| 1 | 0 | 0 | 1 | B |
| 0 | 1 | 1 | 0 | N |
| 0 | 1 | 0 | 1 | P |
| 0 | 0 | 1 | 1 | B |
| 1 | 1 | 1 | 0 | P |
| 1 | 1 | 0 | 1 | S |
| 1 | 0 | 1 | 1 | B |
| 0 | 1 | 1 | 1 | P |
| 1 | 1 | 1 | 1 | N |

## The diagram

The module renders the manual's four-set Venn diagram (red / blue / star / LED)
as SVG ellipses over a `<canvas>` highlight layer. Clicking a region reads back
its trait bits (via precomputed conic coefficients `CON`) and loads them into the
controls. This geometry (`ELL`, `CON`, `LABELS`) is hand-fitted to the artwork —
change it only if the diagram artwork changes.
