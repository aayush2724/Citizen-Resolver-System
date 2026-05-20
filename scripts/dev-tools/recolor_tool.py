#!/usr/bin/env python3
import argparse
import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MAPS = {
    "v1": {
        "#00c896": "#3b82f6",
        "#006c4f": "#1d4ed8",
        "#004d38": "#1e3a8a",
        "#eef6ef": "#eff6ff",
        "#e8f0e9": "#dbeafe",
        "#bbcac1": "#bfdbfe",
        "#6c7a72": "#64748b",
        "#f3fbf5": "#f8fafc",
        "#3c4a43": "#334155",
        "#e2eae4": "#bfdbfe",
    },
    "v2": {
        "#3b82f6": "#1e3a8a",
        "#1d4ed8": "#172554",
        "#1e3a8a": "#0f172a",
    },
    "final": {
        "#3b82f6": "#213D76",
        "#1d4ed8": "#1F345E",
        "#1e3a8a": "#1F345E",
        "#eff6ff": "#E0EDF8",
        "#dbeafe": "#E0EDF8",
        "#bfdbfe": "#7E8AA9",
        "#64748b": "#7E8AA9",
        "#f8fafc": "#E0EDF8",
        "#334155": "#1F345E",
    }
}


def load_mapping(path):
    with open(path, 'r') as f:
        return json.load(f)


def files_from_patterns(patterns):
    out = []
    for p in patterns:
        p = os.path.join(REPO_ROOT, p)
        if os.path.isdir(p):
            for root, _, files in os.walk(p):
                for fn in files:
                    out.append(os.path.join(root, fn))
        else:
            out.append(p)
    return out


def apply_map(mapping, files, dry_run=False):
    for fp in files:
        if not os.path.exists(fp):
            print(f"skipping missing: {fp}")
            continue
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"skip (binary or unreadable): {fp}")
            continue

        new = content
        for old, newc in mapping.items():
            new = new.replace(old, newc)
            new = new.replace(old.upper(), newc)

        if new != content:
            print(f"changes -> {fp}")
            if not dry_run:
                with open(fp, 'w', encoding='utf-8') as f:
                    f.write(new)
        else:
            print(f"no changes: {fp}")


def main():
    parser = argparse.ArgumentParser(description='Recolor tool — consolidate recolor scripts')
    parser.add_argument('--map', choices=list(MAPS.keys()), help='Which built-in color map to apply')
    parser.add_argument('--mapping-file', help='Path to JSON file with a mapping object {"#old":"#new"}')
    parser.add_argument('--targets', nargs='+', default=['client/src/App.jsx', 'client/tailwind.config.js'], help='Files or directories to process (repo-relative)')
    parser.add_argument('--dry-run', action='store_true')

    args = parser.parse_args()

    if not args.map and not args.mapping_file:
        print('Provide --map or --mapping-file')
        parser.print_help()
        sys.exit(1)

    mapping = {}
    if args.map:
        mapping.update(MAPS[args.map])

    if args.mapping_file:
        mapping.update(load_mapping(args.mapping_file))

    files = files_from_patterns(args.targets)
    apply_map(mapping, files, dry_run=args.dry_run)


if __name__ == '__main__':
    main()
