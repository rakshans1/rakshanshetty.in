---
title: "Setting up Elixir with Nix"
slug: "/setup-elixir-with-nix"
date: "2022-10-02T07:41:22.000Z"
description: ""
featured: true
tags: ["Tutorials", "Elixir"]
---

Setting up Elixir dev environment with Nix

## Prerequisites

- nix - Follow [this guide](https://nix.dev/tutorials/install-nix) to install nix in your system

- [direnv](https://direnv.net/docs/installation.html) - helps to initialize nix on the shell when you cd into the project directory

### TLDR

Fork [rakshans1/elixir-starter](https://github.com/rakshans1/elixir-starter) by clicking on `Use this template` and you are good to go.

To manually setup a project

#### Initialize Niv

[Niv](https://github.com/nmattia/niv) helps to manage your dependencies by pinning them to specific versions

Create an empty folder and run

```sh
nix-shell -p niv --run 'niv init'
```

This will create `nix` folder with some files

```
.
└── nix
    ├── sources.json
    └── sources.nix
```

Now create `default.nix` file inside `nix` folder and add the following

```nix
{ sources ? import ./sources.nix
, pkgs ? import sources.nixpkgs { }
}:

with pkgs;

buildEnv {
  name = "builder";
  paths = [
    beam.packages.erlangR25.elixir_1_14
  ];
}
```

#### shell.nix

Create `shell.nix` at the root of the project dir and add the following to it

```nix
{ sources ? import ./nix/sources.nix
, pkgs ? import sources.nixpkgs { }
}:

with pkgs;
let
  inherit (lib) optional optionals;

  basePackages = [
    (import ./nix/default.nix { inherit pkgs; })
    pkgs.niv
  ];

  inputs =  basePackages ++ lib.optionals stdenv.isLinux [ inotify-tools ]
    ++ lib.optionals stdenv.isDarwin
    (with darwin.apple_sdk.frameworks; [ CoreFoundation CoreServices ]);

  hooks = ''
    # this allows mix to work on the local directory
    mkdir -p .nix-mix .nix-hex
    export MIX_HOME=$PWD/.nix-mix
    export HEX_HOME=$PWD/.nix-hex
    # make hex from Nixpkgs available
    # `mix local.hex` will install hex into MIX_HOME and should take precedence
    export MIX_PATH="${beam.packages.erlangR25.hex}/lib/erlang/lib/hex/ebin"
    export PATH=$MIX_HOME/bin:$HEX_HOME/bin:$PATH
    export LANG=C.UTF-8
    # keep your shell history in iex
    export ERL_AFLAGS="-kernel shell_history enabled"
    export MIX_ENV=dev
  '';
in

mkShell {
  buildInputs = inputs;
  shellHook = hooks;

  LOCALE_ARCHIVE = if pkgs.stdenv.isLinux then "${pkgs.glibcLocales}/lib/locale/locale-archive" else "";
}
```

#### Direnv

Finally, to use the above setup in your shell environment we ask direnv to use nix whenever we entire this project directory

Create `.envrc` on root of project directory and add

```
use_nix
```

and run

```sh
direnv allow
```

This will install the specified version of erlang and elixir

```sh
elixir --version

Erlang/OTP 25 [erts-13.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit:ns]

Elixir 1.14.1 (compiled with Erlang/OTP 25)
```
