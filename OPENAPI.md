This repository includes generated OpenAPI specs:

- `openapi.json` - full OpenAPI 3.0 JSON spec
- `openapi.yaml` - same spec in YAML

To regenerate the files locally:

```bash
node scripts/generate-openapi.js
```

Make sure to set your environment variables (e.g., `SERVER_URL`) when generating so the `servers` entries are correct.
