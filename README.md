# psf-bch-wallet

This is a command-line (CLI) app for working with the Bitcoin Cash (BCH) blockchain, and SLP tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bin-cli-boilerplate.svg)](https://npmjs.org/package/bin-cli-boilerplate)
[![Downloads/week](https://img.shields.io/npm/dw/bin-cli-boilerplate.svg)](https://npmjs.org/package/bin-cli-boilerplate)
[![License](https://img.shields.io/npm/l/bin-cli-boilerplate.svg)](https://github.com/christroutner/bin-cli-boilerplate/blob/master/package.json)

This app connects to a [ipfs-bch-wallet-service](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-service) over [IPFS](https://ipfs.io), using the [ipfs-coord](https://github.com/Permissionless-Software-Foundation/ipfs-coord) library. This app uses the [oclif CLI framework](https://oclif.io/) compiled to a binary file using [pkg](https://github.com/vercel/pkg).

## Credit

[oclif](https://oclif.io/) - CLI framework.
[pkg](https://github.com/vercel/pkg) - binary compiler.
[conf-cli](https://github.com/natzcam/conf-cli) - oclif config plugin.

<!-- toc -->

- [psf-bch-wallet](#psf-bch-wallet)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g psf-bch-wallet
$ psf-bch-wallet COMMAND
running command...
$ psf-bch-wallet (-v|--version|version)
psf-bch-wallet/v1.0.0 linux-x64 node-v14.17.0
$ psf-bch-wallet --help [COMMAND]
USAGE
  $ psf-bch-wallet COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`psf-bch-wallet hello`](#psf-bch-wallet-hello)
- [`psf-bch-wallet help [COMMAND]`](#psf-bch-wallet-help-command)

## `psf-bch-wallet hello`

Describe the command here

```
USAGE
  $ psf-bch-wallet hello

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/hello.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv1.0.0/src/commands/hello.js)_

## `psf-bch-wallet help [COMMAND]`

display help for psf-bch-wallet

```
USAGE
  $ psf-bch-wallet help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

<!-- commandsstop -->
