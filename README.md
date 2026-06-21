# naster17 FreeLLMAPI Catalog

Static catalog feed for FreeLLMAPI.

Upload the contents of this folder to the GitHub Pages repository served at:

`https://naster17.github.io/freellmapi-catalog`

Required endpoint:

`https://naster17.github.io/freellmapi-catalog/v1/latest`

Files:

- `v1/latest` is the endpoint FreeLLMAPI fetches.
- `latest.json` is the same snapshot with a `.json` extension for manual viewing.
- `.nojekyll` disables Jekyll processing on GitHub Pages.

This feed is intentionally unsigned. FreeLLMAPI accepts unsigned catalogs only when the selected source is `naster17`.
