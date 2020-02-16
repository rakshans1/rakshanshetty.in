#!/bin/sh

set -e

if tmux has-session -t blog 2> /dev/null; then
  tmux attach -t blog
  exit
fi

tmux new-session -d -s blog -n editor
tmux send-keys -t blog:editor "v " Enter
tmux split-window -t blog:editor -h -p 10
tmux attach -t blog:editor.top
