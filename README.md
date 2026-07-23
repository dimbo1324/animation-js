# Animation JS

Complex animations, cartoon characters, and animated graphical processes in
vanilla JavaScript, CSS, and HTML. No framework, no bundler, zero runtime
dependencies.

## Project Structure

```
animation-js/
├── public/index.html   # One page: one CSS link, one module script
├── src/
│   ├── main.js         # Entry point
│   ├── core/           # Engine: ticker, reactivity, Scene, scene host
│   ├── shell/          # The tile that hosts an animation
│   ├── scenes/         # One folder per animation
│   ├── styles/         # Design tokens, base layer, main.css import root
│   ├── utils/          # Math, easing, icons
│   └── assets/         # Static assets
├── scripts/            # Dev server, rule sync, hook install
├── tests/              # Empty until tests are requested
├── docs/               # Owner's notes
└── .ai/                # AI assistant rules and cross-session memory
```

## Development

```bash
npm install       # also installs the git hooks
npm run dev       # live-reload server on http://localhost:5173
npm run validate  # format check, eslint, stylelint, rule sync check
npm run fix       # auto-fix everything fixable
```

## Code Style

- **Formatter**: Prettier, run automatically on commit
- **Line Length**: 72 characters, vertical-first layout
- **Indentation**: 2 spaces
- **Quotes**: Single
- **Semicolons**: Required
- **Trailing Commas**: Everywhere

## Working with AI assistants

`AGENTS.md` is the full shared ruleset, generated from `.ai/`. Claude Code
reads `CLAUDE.md`; Codex, Copilot, Gemini, and Cursor read their own
generated copies. Edit a module under `.ai/`, then run `npm run ai:sync`.

## License

MIT
