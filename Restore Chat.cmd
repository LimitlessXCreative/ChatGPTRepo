@echo off
cd /d "%~dp0"
py -3 transfer\restore_chat.py --resume
pause
