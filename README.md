# psf-bch-wallet

This is a command-line (CLI) app for working with the Bitcoin Cash (BCH) blockchain, and SLP tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bin-cli-boilerplate.svg)](https://npmjs.org/package/bin-cli-boilerplate)
[![Downloads/week](https://img.shields.io/npm/dw/bin-cli-boilerplate.svg)](https://npmjs.org/package/bin-cli-boilerplate)
[![License](https://img.shields.io/npm/l/bin-cli-boilerplate.svg)](https://github.com/christroutner/bin-cli-boilerplate/blob/master/package.json)

This app connects to a [ipfs-bch-wallet-service](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-service) over [IPFS](https://ipfs.io), using the [ipfs-coord](https://github.com/Permissionless-Software-Foundation/ipfs-coord) library. This app uses the [oclif CLI framework](https://oclif.io/) compiled to a binary file using [pkg](https://github.com/vercel/pkg).

## Credit

- [oclif](https://oclif.io/) - CLI framework.
- [pkg](https://github.com/vercel/pkg) - binary compiler.
- [conf-cli](https://github.com/natzcam/conf-cli) - oclif config plugin.

## Table of Contents

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

- [`psf-bch-wallet conf [KEY] [VALUE]`](#psf-bch-wallet-conf-key-value)
- [`psf-bch-wallet daemon`](#psf-bch-wallet-daemon)
- [`psf-bch-wallet help [COMMAND]`](#psf-bch-wallet-help-command)
- [`psf-bch-wallet wallet-create`](#psf-bch-wallet-wallet-create)
- [`psf-bch-wallet wallet-list`](#psf-bch-wallet-wallet-list)
- [`psf-bch-wallet wallet-remove`](#psf-bch-wallet-wallet-remove)

## `psf-bch-wallet conf [KEY] [VALUE]`

manage configuration

```
USAGE
  $ psf-bch-wallet conf [KEY] [VALUE]

ARGUMENTS
  KEY    key of the config
  VALUE  value of the config

OPTIONS
  -d, --cwd=cwd          config file location
  -d, --delete           delete?
  -h, --help             show CLI help
  -k, --key=key          key of the config
  -n, --name=name        config file name
  -p, --project=project  project name
  -v, --value=value      value of the config
```

_See code: [conf-cli](https://github.com/natzcam/conf-cli/blob/v0.1.9/src/commands/conf.ts)_

## `psf-bch-wallet daemon`

Start a daemon connection to the wallet service.

```
USAGE
  $ psf-bch-wallet daemon

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  This command will start a 'daemon' service, which is a IPFS node that will
  connect to a BCH wallet service over IPFS. It will also start a REST API server,
  which is how the other commands in this app will communicate with the BCH wallet
  service.
```

_See code: [src/commands/daemon.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv1.0.0/src/commands/daemon.js)_

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

## `psf-bch-wallet wallet-create`

Generate a new HD Wallet.

```
USAGE
  $ psf-bch-wallet wallet-create

OPTIONS
  -d, --description=description  Description of the wallet
  -n, --name=name                Name of wallet
```

_See code: [src/commands/wallet-create.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv1.0.0/src/commands/wallet-create.js)_

## `psf-bch-wallet wallet-list`

List existing wallets.

```
USAGE
  $ psf-bch-wallet wallet-list
```

_See code: [src/commands/wallet-list.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv1.0.0/src/commands/wallet-list.js)_

## `psf-bch-wallet wallet-remove`

Remove an existing wallet.

```
USAGE
  $ psf-bch-wallet wallet-remove

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/wallet-remove.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv1.0.0/src/commands/wallet-remove.js)_

<!-- commandsstop -->
