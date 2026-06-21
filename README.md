# naster17 FreeLLMAPI Catalog

Static catalog feed for FreeLLMAPI.

Repository:

`https://github.com/Naster17/freellmapi-catalog`

Upload the contents of this folder to that repository and serve it with GitHub Pages at:

`https://naster17.github.io/freellmapi-catalog`

The FreeLLMAPI UI labels this source as `naster17.com`; until the domain is attached, the app still fetches from the GitHub Pages URL above.

GitHub Pages settings:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Required endpoint:

`https://naster17.github.io/freellmapi-catalog/v1/latest`

Files:

- `v1/latest` is the endpoint FreeLLMAPI fetches.
- `latest.json` is the same snapshot with a `.json` extension for manual viewing.
- `.nojekyll` disables Jekyll processing on GitHub Pages.

This feed is intentionally unsigned. FreeLLMAPI accepts unsigned catalogs only when the selected source is `naster17`.
