---
title: "Vim Tips"
date: "2020-02-16T06:38:10.579Z"
description: ""
image: "./images/dotfiles.png"
featured: false
draft: false
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

```vim
# Time-based undo/redo
g- / g+

# Tree-Based undo/redo
u / <C-R>
```

More comming soon...
