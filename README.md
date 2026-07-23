# Animation JS

Modular vanilla JavaScript animation library built with clean architecture principles.

## Project Structure

```
animation-js/
├── src/
│   ├── components/       # Reusable UI components
│   ├── styles/          # Global and component styles
│   ├── scripts/         # Main application logic
│   ├── utils/           # Utility functions and helpers
│   └── assets/          # Static assets (images, fonts, icons)
├── dist/                # Compiled output
├── public/              # Static files served directly
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── docs/                # Documentation
└── config/              # Configuration files
```

## Development

### Setup

```bash
npm install
```

### Code Formatting

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Lint code style
npm run lint
```

## Code Style

- **Formatter**: Prettier (automatic on commit via Husky)
- **Line Length**: 80 characters max
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Trailing Commas**: ES5 compatible

## License

MIT