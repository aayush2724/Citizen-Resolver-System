Purpose

This folder holds project utility scripts used for local maintenance and developer convenience. These are moved from the repository root into `scripts/dev-tools/` to keep the repo root clean.

What you'll find

 - `scripts/dev-tools/recolor.py` — simple search-and-replace color map for quick visual theme changes.
 - `scripts/dev-tools/recolor2.py`
 - `scripts/dev-tools/recolor_final.py`
 - `scripts/dev-tools/recolor_tool.py` — consolidated CLI that replaces colors using named maps or a JSON mapping file.
- `scripts/dev-tools/replace_report_issue.py` — automated replacement for the `ReportIssue` component inside `client/src/App.jsx`.
- `scripts/dev-tools/add_dark_mode.py` — adds dark-mode Tailwind variants to `client/src/App.jsx`.

Usage

Run the scripts with the system Python (preferably inside a virtualenv):

```bash
python3 scripts/dev-tools/recolor_final.py
python3 scripts/dev-tools/replace_report_issue.py
```

Notes & recommendations

- These scripts modify files in-place. Commit or stash changes before running them.
- Consider wrapping frequently used actions in npm scripts (example below) or a Makefile for easier developer experience.

Suggested npm entries (optional)

```json
"scripts": {
  "dev:recolor": "python3 scripts/dev-tools/recolor_tool.py --map final",
  "dev:recolor2": "python3 scripts/dev-tools/recolor_tool.py --map v2",
  "dev:replace-report": "python3 scripts/dev-tools/replace_report_issue.py",
  "dev:add-dark-mode": "python3 scripts/dev-tools/add_dark_mode.py",
  "migrate:assets": "bash scripts/migrate_assets.sh"
}
```

New utilities:

- `scripts/migrate_assets.sh` — moves `attached_assets/stock_images/*` into `client/public/images/stock_images/` while skipping duplicates. Run it locally to perform the move.

Notes: the CLI is idempotent and supports `--dry-run`.

If you want, I can add these npm script entries to the root `package.json` or create a `Makefile`. Which do you prefer?