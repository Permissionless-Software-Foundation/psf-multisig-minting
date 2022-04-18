# psf-bch-wallet

This is a command-line (CLI) app for working with the Bitcoin Cash (BCH) blockchain, and SLP tokens.

This app connects to a [ipfs-bch-wallet-service](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-service) over [IPFS](https://ipfs.io), using the [ipfs-coord](https://github.com/Permissionless-Software-Foundation/ipfs-coord) library. This app uses the [oclif CLI framework](https://oclif.io/).

This app is intended for developers who want to work with the BCH blockchain. To see how this software fits in with the Cash Stack architecture, devs should read this blog post on [Realizing the Web 3 Cash Stack](https://bafybeie3w6ykd3ur6b6ytxoopi6p7vipmyvdyq7s2aw5ngsenhtjvyp4d4.ipfs.dweb.link/blog/realizing-the-web-3-cash-stack).

- [(Video) How to Install and Use](https://youtu.be/45YEeZi_8Kc)

## Install

- `git clone` this repository.
- `npm install` dependencies.
- `./bin/run help` to see a list of available commands.
- `./bin/run wallet-create` to create a wallet. Wallet files are stored in the `.wallets` directory.

## Configuration

By default, this app uses [free-bch.fullstack.cash](https://free-bch.fullstack.cash) as its back end service for working with the BCH blockchain. That back-end service is simply a copy of [ipfs-bch-wallet-consumer](https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-consumer). By running your own copy of ipfs-bch-wallet-consumer, you can have greater reliability and can use this app to switch between different [global back ends](https://bafybeie3w6ykd3ur6b6ytxoopi6p7vipmyvdyq7s2aw5ngsenhtjvyp4d4.ipfs.dweb.link/blog/realizing-the-web-3-cash-stack). If `free-bch.fullstack.cash` goes down for some reason, running your own instance of `ipfs-bch-wallet-consumer` allows you to easily switch to any functional back end on the internet.

Switch to a local instance of `ipfs-bch-wallet-consumer`:

- `./bin/run conf -k restServer -v http://localhost:5001`

Switch back to [free-bch.fullstack.cash](https://free-bch.fullstack.cash):

- `./bin/run conf -k restServer -v https://free-bch.fullstack.cash`

Explore the other configuration settings:

- `./bin/run conf`

## License

[MIT](./LICENSE.md)

## Credit

- [js-ipfs](https://www.npmjs.com/package/ipfs) - The IPFS node software.
- [ipfs-coord](https://github.com/Permissionless-Software-Foundation/ipfs-coord) - IPFS subnet coordination library.
- [bch-js](https://github.com/Permissionless-Software-Foundation/bch-js) - BCH toolkit.
- [oclif](https://oclif.io/) - CLI framework.
- [conf-cli](https://github.com/natzcam/conf-cli) - oclif config plugin.

## Table of Contents

<!-- toc -->
* [psf-bch-wallet](#psf-bch-wallet)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

```sh-session
$ npm install
$ ./bin/run [COMMAND] --help
$ ./bin/run COMMAND
```

# Commands

In the commands below, replace `psf-bch-wallet` with `./bin/run`.

<!-- commands -->
* [`psf-bch-wallet conf [KEY] [VALUE]`](#psf-bch-wallet-conf-key-value)
* [`psf-bch-wallet help [COMMAND]`](#psf-bch-wallet-help-command)
* [`psf-bch-wallet ipfs-peers`](#psf-bch-wallet-ipfs-peers)
* [`psf-bch-wallet ipfs-relays`](#psf-bch-wallet-ipfs-relays)
* [`psf-bch-wallet ipfs-status`](#psf-bch-wallet-ipfs-status)
* [`psf-bch-wallet msg-check`](#psf-bch-wallet-msg-check)
* [`psf-bch-wallet msg-read`](#psf-bch-wallet-msg-read)
* [`psf-bch-wallet msg-send`](#psf-bch-wallet-msg-send)
* [`psf-bch-wallet p2wdb-read`](#psf-bch-wallet-p2wdb-read)
* [`psf-bch-wallet p2wdb-service`](#psf-bch-wallet-p2wdb-service)
* [`psf-bch-wallet p2wdb-write`](#psf-bch-wallet-p2wdb-write)
* [`psf-bch-wallet send-bch`](#psf-bch-wallet-send-bch)
* [`psf-bch-wallet send-tokens`](#psf-bch-wallet-send-tokens)
* [`psf-bch-wallet token-burn`](#psf-bch-wallet-token-burn)
* [`psf-bch-wallet wallet-addrs`](#psf-bch-wallet-wallet-addrs)
* [`psf-bch-wallet wallet-balances`](#psf-bch-wallet-wallet-balances)
* [`psf-bch-wallet wallet-create`](#psf-bch-wallet-wallet-create)
* [`psf-bch-wallet wallet-list`](#psf-bch-wallet-wallet-list)
* [`psf-bch-wallet wallet-remove`](#psf-bch-wallet-wallet-remove)
* [`psf-bch-wallet wallet-scan`](#psf-bch-wallet-wallet-scan)
* [`psf-bch-wallet wallet-service`](#psf-bch-wallet-wallet-service)
* [`psf-bch-wallet wallet-service-test`](#psf-bch-wallet-wallet-service-test)
* [`psf-bch-wallet wallet-sweep`](#psf-bch-wallet-wallet-sweep)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `psf-bch-wallet ipfs-peers`

Query the state of subnet peers

```
USAGE
  $ psf-bch-wallet ipfs-peers

OPTIONS
  -a, --all  Display all data about peers
```

_See code: [src/commands/ipfs-peers.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/ipfs-peers.js)_

## `psf-bch-wallet ipfs-relays`

Query the state of circuit relays

```
USAGE
  $ psf-bch-wallet ipfs-relays
```

_See code: [src/commands/ipfs-relays.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/ipfs-relays.js)_

## `psf-bch-wallet ipfs-status`

Query the state of the IPFS node

```
USAGE
  $ psf-bch-wallet ipfs-status
```

_See code: [src/commands/ipfs-status.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/ipfs-status.js)_

## `psf-bch-wallet msg-check`

Check signed messages

```
USAGE
  $ psf-bch-wallet msg-check

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/msg-check.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/msg-check.js)_

## `psf-bch-wallet msg-read`

Read signed messages

```
USAGE
  $ psf-bch-wallet msg-read

OPTIONS
  -n, --name=name  Name of wallet
  -t, --txid=txid  Transaction ID
```

_See code: [src/commands/msg-read.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/msg-read.js)_

## `psf-bch-wallet msg-send`

Send encrypted messages

```
USAGE
  $ psf-bch-wallet msg-send

OPTIONS
  -b, --bchAddress=bchAddress  BCH Address
  -m, --message=message        Message to send
  -n, --name=name              Name of wallet
  -s, --subject=subject        Message Subject
```

_See code: [src/commands/msg-send.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/msg-send.js)_

## `psf-bch-wallet p2wdb-read`

Read an entry from the P2WDB

```
USAGE
  $ psf-bch-wallet p2wdb-read

OPTIONS
  -h, --hash=hash  Hash representing P2WDB entry
```

_See code: [src/commands/p2wdb-read.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/p2wdb-read.js)_

## `psf-bch-wallet p2wdb-service`

List and/or select a P2WDB service provider.

```
USAGE
  $ psf-bch-wallet p2wdb-service

OPTIONS
  -s, --select=select  Switch to a given IPFS ID for P2WDB service.
```

_See code: [src/commands/p2wdb-service.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/p2wdb-service.js)_

## `psf-bch-wallet p2wdb-write`

Burn a specific quantity of SLP tokens.

```
USAGE
  $ psf-bch-wallet p2wdb-write

OPTIONS
  -a, --appId=appId  appId string to categorize data
  -c, --centralized  Use centralized mode to connect to P2WDB.
  -d, --data=data    String of data to write to the P2WDB
  -n, --name=name    Name of wallet
```

_See code: [src/commands/p2wdb-write.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/p2wdb-write.js)_

## `psf-bch-wallet send-bch`

Send BCH

```
USAGE
  $ psf-bch-wallet send-bch

OPTIONS
  -a, --sendAddr=sendAddr  Cash address to send to
  -n, --name=name          Name of wallet
  -q, --qty=qty            Quantity in BCH
```

_See code: [src/commands/send-bch.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/send-bch.js)_

## `psf-bch-wallet send-tokens`

Send Tokens

```
USAGE
  $ psf-bch-wallet send-tokens

OPTIONS
  -a, --sendAddr=sendAddr  Cash or SimpleLedger address to send to
  -n, --name=name          Name of wallet
  -q, --qty=qty
  -t, --tokenId=tokenId    Token ID
```

_See code: [src/commands/send-tokens.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/send-tokens.js)_

## `psf-bch-wallet token-burn`

Burn a specific quantity of SLP tokens.

```
USAGE
  $ psf-bch-wallet token-burn

OPTIONS
  -n, --name=name        Name of wallet
  -q, --qty=qty          Quantity of tokens to burn
  -t, --tokenId=tokenId  tokenId of token to burn
```

_See code: [src/commands/token-burn.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-burn.js)_

## `psf-bch-wallet wallet-addrs`

List the different addresses for a wallet.

```
USAGE
  $ psf-bch-wallet wallet-addrs

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/wallet-addrs.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-addrs.js)_

## `psf-bch-wallet wallet-balances`

Display the balances of the wallet

```
USAGE
  $ psf-bch-wallet wallet-balances

OPTIONS
  -n, --name=name  Name of wallet
  -v, --verbose    Show verbose UTXO information
```

_See code: [src/commands/wallet-balances.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-balances.js)_

## `psf-bch-wallet wallet-create`

Generate a new HD Wallet.

```
USAGE
  $ psf-bch-wallet wallet-create

OPTIONS
  -d, --description=description  Description of the wallet
  -n, --name=name                Name of wallet
```

_See code: [src/commands/wallet-create.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-create.js)_

## `psf-bch-wallet wallet-list`

List existing wallets.

```
USAGE
  $ psf-bch-wallet wallet-list
```

_See code: [src/commands/wallet-list.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-list.js)_

## `psf-bch-wallet wallet-remove`

Remove an existing wallet.

```
USAGE
  $ psf-bch-wallet wallet-remove

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/wallet-remove.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-remove.js)_

## `psf-bch-wallet wallet-scan`

Scan different derivation paths of a 12 word mnemonic for tx history.

```
USAGE
  $ psf-bch-wallet wallet-scan

OPTIONS
  -m, --mnemonic=mnemonic  mnemonic phrase to generate addresses, wrapped in quotes

DESCRIPTION
  Scans the first 20 addresses of each derivation path for
  history and balance of the given mnemonic. If any of them had a history, scans
  the next 20, until it reaches a batch of 20 addresses with no history. The -m
  flag is used to pass it a mnemonic phrase. Be sure to enclose the words in
  quotes.

  This command is handy for people who maintain multiple wallets. This allows easy
  scanning to see if a mnemonic holds any funds on any of the commonly used
  derivation paths.

  Derivation pathes used:
  145 - BIP44 standard path for Bitcoin Cash
  245 - BIP44 standard path for SLP tokens
  0 - Used by common software like the Bitcoin.com wallet and Honest.cash
```

_See code: [src/commands/wallet-scan.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-scan.js)_

## `psf-bch-wallet wallet-service`

List and/or select a wallet service provider.

```
USAGE
  $ psf-bch-wallet wallet-service

OPTIONS
  -s, --select=select  Switch to a given IPFS ID for wallet service.
```

_See code: [src/commands/wallet-service.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-service.js)_

## `psf-bch-wallet wallet-service-test`

Run end-to-end tests on the selected wallet service.

```
USAGE
  $ psf-bch-wallet wallet-service-test

DESCRIPTION
  This command will run a series of end-to-end (e2e) tests on a current global
  back end selected with the 'wallet-service' command. It will test that the
  selected service if fully function, and this app can adaquately communicate
  with that service.
```

_See code: [src/commands/wallet-service-test.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-service-test.js)_

## `psf-bch-wallet wallet-sweep`

Sweep funds from one wallet into another

```
USAGE
  $ psf-bch-wallet wallet-sweep

OPTIONS
  -d, --derivation=derivation  Derivation path. Will default to 245 if not specified. Common values are 245, 145, and 0
  -m, --mnemonic=mnemonic      12-word mnemonic phrase, wrapped in quotes
  -n, --name=name              name of receiving wallet
  -w, --wif=wif                WIF private key controlling funds of a single address

DESCRIPTION
  Sweep funds from a single private key (WIF) or a whole HD wallet (mnemonic)
  into another wallet. Works for both BCH and tokens.

  If the target wallet does not have enough funds to pay transaction fees, fees
  are paid from the receiving wallet. In the case of a mnemonic, a derivation path
  can be specified.

  Either a WIF or a mnemonic must be specified.
```

_See code: [src/commands/wallet-sweep.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/wallet-sweep.js)_
<!-- commandsstop -->
