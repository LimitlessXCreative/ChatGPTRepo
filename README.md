# GPT Repo

Portable NZT-48 3D project and chat transfer kit.

## Continue on another computer

1. Install the ChatGPT desktop app and sign into your account. Install Git and Python 3 if needed.
2. Clone this **private** repository onto that computer.
3. Open the repository folder as a local project in Codex.
4. Restore the saved session using the helper below. This copies only this chat's saved session, not passwords or your global app settings.

**Mac:** double-click `Restore Chat.command` (or run `python3 transfer/restore_chat.py --resume` from Terminal).

**Windows:** double-click `Restore Chat.cmd` (or run `py -3 transfer/restore_chat.py --resume` in a terminal).

The helper restores chat ID `01a1206a-e007-72e1-b2b2-bd16bd34b9fe`, updates its working directory to this checkout, and resumes it with Codex CLI if available. Sign into Codex on the new computer when asked. On Mac, the launcher also checks for the CLI bundled in ChatGPT.app. If Codex CLI isn't found, install it using the official Codex setup instructions and run the helper again.

The original rollout format is an internal Codex format. The source installation (0.162.0-alpha.2) successfully read this exported session in a clean isolated profile under the original thread ID. Desktop sidebar discovery and a complete resumed turn must still be checked on the destination. If it doesn't appear immediately, use the CLI resume command printed by the helper. Do not delete the source Mac's copy before that check.

**This is a one-time session restore, not automatic bidirectional chat syncing.** Git syncs the project files. Close the chat on one computer before continuing the same restored session elsewhere; do not run diverging copies at once. For supported app-managed live migration, use Codex's host-to-host Hand off after connecting the destination and saving the same Git project there.

## Preview the website

From this folder:

```sh
python3 -m http.server 4190 --bind 127.0.0.1 --directory website
```

On Windows, use `py -3` in place of `python3`.

Open:

http://127.0.0.1:4190/nzt48/design_handoff_nzt48/NZT48%20V1%20-%203D.dc.html?pill=pbr-fixed&motion=continuous-final

## Contents

- `website/`: current V1, V2, V3, shared code, GLBs, textures and web assets.
- `outputs/nzt-*`: original NZT models, materials, transparent videos, packaging renders and earlier deliverables.
- `review-v1-gold-pill/`: capsule/material review, motion work and the transparent packshot render tool. This folder's studio tool expects `website/nzt48` beside it; its import paths are corrected for this repository.
- `references/embedded/`: user image attachments recovered from the saved session. Temporary original clipboard paths no longer exist on this Mac; embedded images and rollout history are preserved.
- `chat/conversation.md`: readable user/assistant messages, excluding tool output.
- `chat/session-parts/`: compressed full saved session in verified chunks; includes context, tool history and embedded images.
- `chat/session-manifest.json`: checksums and original chat identity.
- `CONTEXT.md`: current design decisions and project status.
- `transfer/restore_chat.py`: non-overwriting session restore and optional CLI resume.

Keep this repository private: the chat archive contains private conversation content and local paths. No account authentication files, passwords, browser profiles or global settings were copied.

The original website source repository remains:
https://github.com/LimitlessXCreative/limitlessx-shopify-landing-pages

Latest source commit at preparation: `355dd59a1926e2a4f683eec7dd1749ad2bed5f05`.

## Official references

- https://learn.chatgpt.com/docs/remote-connections
- https://learn.chatgpt.com/docs/cli/reference
- https://learn.chatgpt.com/docs/reference/troubleshooting
