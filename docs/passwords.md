# Senhas (Passwords) — rules

Manual section: **"A Respeito das Senhas"** (pt-BR v2).

## How the module works in-game

The module shows 5 letter positions. Above and below each letter are buttons
that cycle through the possible letters for **that position**. Exactly one
combination of the available letters spells one of the words in the list below.
Press *enviar* (submit) once the correct word is set.

## Solving strategy (what the cheat sheet automates)

For each of the 5 positions, cycle through and note every letter you can reach.
Only one word from the list can be built from the available letters, position by
position. The tool filters the list as you type the letters seen in each column;
when a single word remains, that is the password.

## The complete word list (35 words)

All are exactly 5 letters, unaccented:

```
acesa  ajuda  amigo  antes  arcos
baile  balas  bispo  chefe  cheio
cinto  cravo  etapa  etnia  flora
lazer  legal  lugar  parte  parto
perto  porta  regra  resto  salve
sente  setor  sexta  tecla  tinta
torta  touro  trato  valer  veado
```

> Note: this is the pt-BR list and differs from the English manual's word list.
> The list lives in `modules/passwords.js` as `WORDS` — keep the two in sync.
