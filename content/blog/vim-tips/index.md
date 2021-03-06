---
title: "Vim Tips"
date: "2020-02-16T06:38:10.579Z"
modified: "2020-04-18T07:38:10.579Z"
description: ""
image: "./images/dotfiles.png"
featured: false
tags: ["Tips"]
---

List of vim tips I learned

- Save a read-only file with **sudo** with

```shell
:w !sudo tee %
```

- Get the full path of current buffer

```shell
1<C-G>
```

- Vim Undo history

```shell
# Time-based undo/redo
g- / g+

# Tree-Based undo/redo
u / <C-R>
```


- Toogle Case with tilde in normal mode

```shell
~
```

- Repeat previous substitution `:s`

```shell
:&

# Use previous flags
:&&

# Change flags
:&gc

# Repeat last substitution in normal mode
g&

# Represent match pattern in a substitution

:s/sub/&stitution/ # Here & is sub
```

- Change variable value

```shell
:let &<tab>
:let &hlsearch=1
```

- Expression evaluation in insert mode

```shell
<Ctrl-r>=  # 5*6 <Enter>
```

- Fix Indentation with syntax support

```shell
==  #In Normal Mode
=   # In Visual Mode
```

- Swap window

```shell
<Ctrl-w><Ctrl-r>
```

More comming soon...
