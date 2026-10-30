# @skeuos-labs/mizmor

Canonical presentation model, format decoders/encoders, and cross-format conversion engine for church worship presentations.

## Formats Supported

| Format | Extension | Read | Write | Notes |
|---|---|---|---|---|
| **ProPresenter 7** | `.pro` | ✅ | ✅ | Protobuf binary parser & serializer |
| **ProPresenter 6** | `.pro6` | ✅ | ❌ | XML-based legacy parser |
| **VideoPsalm** | `.vpc`, `.json` | ✅ | ✅ | Encrypted ZIP archive & raw JSON |
| **FreeShow** | `.show` | ✅ | ✅ | Modern open-source presentation format |
| **PowerPoint** | `.pptx` | ✅ | ✅ | OOXML slide parser & section generator |
| **Plain Text** | `.txt` | ✅ | ✅ | Slide & section marker formatted text |

## Installation

Configure `.npmrc` for GitHub Packages:

```ini
@skeuos-labs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Install via pnpm:

```bash
pnpm add @skeuos-labs/mizmor
```

## Public API

### Browser-Safe (`@skeuos-labs/mizmor`)

```ts
import {
  importFile,
  exportLibrary,
  exportPresentation,
  convertFile,
  FORMAT_REGISTRY,
} from '@skeuos-labs/mizmor';

// Import any supported format bytes into canonical Library
const result = await importFile(fileBytes, 'Song.pro');
if (result.ok) {
  const library = result.value;
  console.log(`Imported ${library.presentations.length} presentations`);
}

// Convert bytes directly between formats
const conv = await convertFile(sourceBytes, 'input.vpc', 'freeshow');
if (conv.ok) {
  const showBytes = conv.value;
}
```

### Node / CLI Runtime (`@skeuos-labs/mizmor/node`)

Node-specific utilities and file-system helpers:

```ts
import { batchConvert, scanDirectory } from '@skeuos-labs/mizmor/node';
```

## CLI Usage

When installed globally or run via npx/pnpm dlx:

```bash
# List supported formats
mizmor formats

# Inspect a presentation file
mizmor inspect song.pro

# Convert file
mizmor convert song.pro -t vpc -o song.vpc

# Batch convert folder
mizmor batch ./input-folder -t pptx -o ./output-folder
```

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT
