# EvalGate Documentation Website

This is the official EvalGate documentation website built with [Docusaurus](https://docusaurus.io/). It serves both human-readable documentation and LLM-optimized endpoints.

## Features

- **Landing Page** - Recreated pixel-perfect design from original site
- **Versioned Documentation** - Support for v0.2.0, v0.3.0, and future versions
- **LLM Endpoints** - Raw markdown files for AI agent consumption
- **13+ Evaluator Types** - Comprehensive documentation with examples
- **GitHub Actions Integration** - Complete CI/CD setup guides
- **Real-world Examples** - Customer support, RAG, code generation, etc.

## Development

### Installation
```bash
npm install
```

### Local Development
```bash
npm start
```
Opens http://localhost:3000 with hot reload.

### Build
```bash
npm run build
```
Generates static content into the `build` directory.

### Update LLM Documentation
```bash
npm run update-docs
```
Syncs complete.md files with individual documentation pages.

## Deployment

### Vercel (Recommended)

1. Connect this repository to Vercel
2. Set build directory to `website/`  
3. Build command: `npm run build`
4. Output directory: `build/`
5. Point evalgate.aotp.ai domain to the deployment

### Manual Deployment

```bash
# Build the site
npm run build

# Serve locally to test
npm run serve
```

## LLM Endpoints

The site provides raw markdown documentation for LLMs:

- `/complete.md` - Latest version (v0.3.0) complete documentation
- `/v0.2.0-complete.md` - Legacy v0.2.0 documentation  
- `/v0.3.0-complete.md` - v0.3.0 complete documentation (auto-generated)

These files are automatically updated during build from the individual documentation pages.

## Documentation Structure

```
docs/                    # Latest version docs (v0.3.0)
├── intro.md            # Quick start guide
├── configuration.md    # Complete YAML reference  
├── evaluators.md       # All 13+ evaluator types
├── github-actions.md   # CI/CD integration
└── examples.md         # Real-world use cases

versioned_docs/         # Historical versions
├── version-v0.2.0/    # Legacy documentation
└── version-v0.3.0/    # Frozen v0.3.0 docs

static/                 # LLM-optimized endpoints
├── complete.md         # Latest complete docs
├── v0.2.0-complete.md # Legacy complete docs
└── v0.3.0-complete.md # v0.3.0 complete docs
```

## Adding New Versions

```bash
# Create a new version
npm run docusaurus docs:version v0.4.0

# Update complete docs
npm run update-docs
```

## Contributing

1. Update documentation in `docs/` directory
2. Run `npm run update-docs` to sync LLM endpoints  
3. Test locally with `npm start`
4. Commit and deploy

The site automatically rebuilds on push to main branch when connected to Vercel.
