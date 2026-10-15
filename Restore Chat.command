#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
python3 transfer/restore_chat.py --resume
printf '\nPress Return to close…'
read answer
