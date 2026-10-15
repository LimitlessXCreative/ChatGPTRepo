#!/usr/bin/env python3
"""Verify and restore only the exported NZT chat; never replace other sessions."""
import argparse
import gzip
import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CHAT = ROOT / 'chat'

def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--codex-home', type=Path, default=Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))))
    parser.add_argument('--resume', action='store_true', help='Launch the restored session in Codex CLI.')
    parser.add_argument('--verify-only', action='store_true', help='Validate the archive without installing it.')
    args = parser.parse_args()
    manifest = json.loads((CHAT / 'session-manifest.json').read_text())
    with tempfile.TemporaryDirectory(prefix='gpt-repo-restore-') as temp:
        combined = Path(temp) / 'session.jsonl.gz'
        h = hashlib.sha256()
        with combined.open('wb') as out:
            for entry in manifest['parts']:
                part = CHAT / 'session-parts' / entry['name']
                if part.stat().st_size != entry['bytes'] or sha256(part) != entry['sha256']:
                    raise ValueError('Archive verification failed: ' + entry['name'])
                with part.open('rb') as src:
                    for chunk in iter(lambda: src.read(1024 * 1024), b''):
                        out.write(chunk)
                        h.update(chunk)
        if h.hexdigest() != manifest['compressed_sha256']:
            raise ValueError('Combined archive checksum mismatch.')
        restored = Path(temp) / manifest['filename']
        records = 0
        with gzip.open(combined, 'rt', encoding='utf-8') as src, restored.open('w', encoding='utf-8', newline='\n') as out:
            for line in src:
                record = json.loads(line)
                payload = record.get('payload', {})
                if record.get('type') in ('session_meta', 'turn_context') and 'cwd' in payload:
                    payload['cwd'] = str(ROOT)
                out.write(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n')
                records += 1
        print(f'Archive verified: {records:,} records, original chat {manifest["thread_id"]}.')
        if args.verify_only:
            return 0
        home = args.codex_home.expanduser().resolve()
        target = home / manifest['relative_session_path'] / manifest['filename']
        # Never overwrite a session that might have continued on this computer.
        existing = list((home / 'sessions').rglob('*' + manifest['thread_id'] + '*.jsonl')) if (home / 'sessions').exists() else []
        if existing:
            print('This chat already exists on this computer. Keeping the existing copy:')
            print(existing[0])
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as dst, restored.open('rb') as src:
                shutil.copyfileobj(src, dst)
            print('Restored session:', target)
    binary = shutil.which('codex')
    if not binary and sys.platform == 'darwin':
        bundled = Path('/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex')
        if bundled.is_file():
            binary = str(bundled)
    command = [binary or 'codex', 'resume', '--no-daemon', '--cd', str(ROOT), manifest['thread_id']]
    print('\nResume command:')
    print(subprocess.list2cmdline(command) if os.name == 'nt' else shlex.join(command))
    print('\nOpen this repository folder as a local Codex project in the desktop app.')
    print('The website, models and renders are in this checkout; no source Mac connection is needed.')
    if args.resume:
        if not binary:
            print('\nCodex CLI was not found. Install/sign into Codex, then run the command above.')
            return 2
        return subprocess.call(command, cwd=ROOT, env={**os.environ, 'CODEX_HOME': str(home)})
    return 0

if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, EOFError) as error:
        print('Restore stopped:', error, file=sys.stderr)
        raise SystemExit(1)
