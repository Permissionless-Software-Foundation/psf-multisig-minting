# psf-multisig-minting

This is a command-line (CLI) app for working with the Bitcoin Cash (BCH) blockchain, and SLP tokens.

This app is forked from [psf-bch-wallet](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet). It adds specialized commands for minting SLP tokens using a multisig wallet.

## Install

- `git clone` this repository.
- `npm install` dependencies.
- `./bin/run help` to see a list of available commands.
- `./bin/run wallet-create` to create a wallet. Wallet files are stored in the `.wallets` directory.

## License

[MIT](./LICENSE.md)

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
* [`psf-bch-wallet msg-sign`](#psf-bch-wallet-msg-sign)
* [`psf-bch-wallet msg-verify`](#psf-bch-wallet-msg-verify)
* [`psf-bch-wallet p2wdb-read`](#psf-bch-wallet-p2wdb-read)
* [`psf-bch-wallet p2wdb-write`](#psf-bch-wallet-p2wdb-write)
* [`psf-bch-wallet send-bch`](#psf-bch-wallet-send-bch)
* [`psf-bch-wallet send-tokens`](#psf-bch-wallet-send-tokens)
* [`psf-bch-wallet token-burn`](#psf-bch-wallet-token-burn)
* [`psf-bch-wallet token-create-fungible`](#psf-bch-wallet-token-create-fungible)
* [`psf-bch-wallet token-create-group`](#psf-bch-wallet-token-create-group)
* [`psf-bch-wallet token-create-nft`](#psf-bch-wallet-token-create-nft)
* [`psf-bch-wallet token-info`](#psf-bch-wallet-token-info)
* [`psf-bch-wallet token-mda-tx`](#psf-bch-wallet-token-mda-tx)
* [`psf-bch-wallet token-mint`](#psf-bch-wallet-token-mint)
* [`psf-bch-wallet token-tx-history`](#psf-bch-wallet-token-tx-history)
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

## `psf-bch-wallet msg-sign`

Cryptographically sign a message.

```
USAGE
  $ psf-bch-wallet msg-sign

OPTIONS
  -m, --msg=msg    Cleartext message to sign
  -n, --name=name  Name of wallet

DESCRIPTION
  Generate a signature from a clear-text message and the private key of your wallet.
  The system verifying the signature will also need the BCH address of the walllet.
```

_See code: [src/commands/msg-sign.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/msg-sign.js)_

## `psf-bch-wallet msg-verify`

Verify a signed message

```
USAGE
  $ psf-bch-wallet msg-verify

OPTIONS
  -b, --bchAddr=bchAddr  BCH address of signer.
  -m, --msg=msg          Cleartext message used to generate the signature.
  -s, --sig=sig          Signature to verify.

DESCRIPTION
  Verify the authenticity of a signed message.
```

_See code: [src/commands/msg-verify.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/msg-verify.js)_

## `psf-bch-wallet p2wdb-read`

Read an entry from the P2WDB

```
USAGE
  $ psf-bch-wallet p2wdb-read

OPTIONS
  -h, --hash=hash  Hash CID representing P2WDB entry
```

_See code: [src/commands/p2wdb-read.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/p2wdb-read.js)_

## `psf-bch-wallet p2wdb-write`

Write an entry to the pay-to-write database (P2WDB)

```
USAGE
  $ psf-bch-wallet p2wdb-write

OPTIONS
  -a, --appId=appId  appId string to categorize data
  -d, --data=data    String of data to write to the P2WDB
  -n, --name=name    Name of wallet

DESCRIPTION
  In order to execute this command, the wallet must contain some BCH and some PSF
  token, in order to pay for the write to the P2WDB.
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
  -q, --qty=qty          Quantity of tokens to burn. If quantity is 0, all tokens will be burned.
  -t, --tokenId=tokenId  tokenId of token to burn
```

_See code: [src/commands/token-burn.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-burn.js)_

## `psf-bch-wallet token-create-fungible`

Create a new SLP Type1 fugible token.

```
USAGE
  $ psf-bch-wallet token-create-fungible

OPTIONS
  -b, --baton                  (optional) create a minting baton
  -d, --decimals=decimals      Decimals used by the token
  -h, --hash=hash              (optional) Document hash of the group
  -m, --tokenName=tokenName    Name of token
  -n, --walletName=walletName  Name of wallet to pay for transaction
  -q, --qty=qty                Quantity of tokens to create
  -t, --ticker=ticker          Ticker of the group
  -u, --url=url                (optional) Document URL of the group

DESCRIPTION
  Creating a minting baton is optional. If a baton address is not specified, then the
  baton is burned and makes the it a 'fixed supply' token.
```

_See code: [src/commands/token-create-fungible.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-create-fungible.js)_

## `psf-bch-wallet token-create-group`

Create a new SLP Group token.

```
USAGE
  $ psf-bch-wallet token-create-group

OPTIONS
  -h, --hash=hash              (optional) Document hash of the group
  -m, --tokenName=tokenName    Name of token
  -n, --walletName=walletName  Name of wallet to pay for transaction
  -q, --qty=qty                (optional) Quantity of tokens to create. Defaults to 1
  -t, --ticker=ticker          Ticker of the group
  -u, --url=url                (optional) Document URL of the group

DESCRIPTION
  Group tokens are used to generate NFTs. Read more about the relationship:
  https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/bch/applications/slp/nft
```

_See code: [src/commands/token-create-group.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-create-group.js)_

## `psf-bch-wallet token-create-nft`

Create a new SLP Group token.

```
USAGE
  $ psf-bch-wallet token-create-nft

OPTIONS
  -h, --hash=hash              (optional) Document hash of the group
  -i, --tokenId=tokenId        Token ID of Group token to burn, to generate the NFT
  -m, --tokenName=tokenName    Name of token
  -n, --walletName=walletName  Name of wallet to pay for transaction
  -t, --ticker=ticker          Ticker of the group
  -u, --url=url                (optional) Document URL of the group

DESCRIPTION
  Group tokens are used to generate NFTs. Read more about the relationship:
  https://github.com/Permissionless-Software-Foundation/bch-js-examples/tree/master/bch/applications/slp/nft
```

_See code: [src/commands/token-create-nft.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-create-nft.js)_

## `psf-bch-wallet token-info`

Get information on a token

```
USAGE
  $ psf-bch-wallet token-info

OPTIONS
  -t, --tokenId=tokenId  The ID of the token to lookup

DESCRIPTION
  Retrieves the Genesis data for a token. If PS002 mutable and immutable data is
  attached to the token, it is retrieved from IPFS.
```

_See code: [src/commands/token-info.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-info.js)_

## `psf-bch-wallet token-mda-tx`

Create TXID for token mutable data

```
USAGE
  $ psf-bch-wallet token-mda-tx

OPTIONS
  -a, --mda=mda                Mutable data address
  -n, --walletName=walletName  Name of wallet to pay for transaction

DESCRIPTION
  MDA is an acrynym for 'Mutable Data Address'

  This command is used to generate a TXID for attaching mutable data to a token.
  Given a BCH address, it generates a transaction to turn that address into
  the controller of mutable data for a token. This generates a TXID which is
  used in the tokens 'documentHash' field when creating the token.

  PS002 specification for mutable data:
  https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps002-slp-mutable-data.md
```

_See code: [src/commands/token-mda-tx.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-mda-tx.js)_

## `psf-bch-wallet token-mint`

Mint new Fungible (Type 1) or Group tokens

```
USAGE
  $ psf-bch-wallet token-mint

OPTIONS
  -n, --name=name          Name of wallet to pay for transaction
  -q, --qty=qty            Quantity of tokens to create
  -r, --receiver=receiver  (optional) Receiver of new baton. Defaults to same wallet. null burns baton.
  -t, --tokenId=tokenId    Token ID

DESCRIPTION
  If the wallet contains a minting baton from creating a Fungible or Group token,
  this command can be used to mint new tokens into existence.

  The '-r' flag is optional. By default the minting baton will be sent back to the
  origionating wallet. A different address can be specified by the -r flag. Passing
  a value of 'null' will burn the minting baton, removing the ability to mint
  new tokens.
```

_See code: [src/commands/token-mint.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-mint.js)_

## `psf-bch-wallet token-tx-history`

Get transaction history for a token

```
USAGE
  $ psf-bch-wallet token-tx-history

OPTIONS
  -t, --tokenId=tokenId  The ID of the token to lookup

DESCRIPTION
  Retrieves the transaction history for a token. This is every transaction that
  has involved the token. The data is more informative for an NFT than it is for
  a fungible token.
```

_See code: [src/commands/token-tx-history.js](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet/blob/vv2.14.2/src/commands/token-tx-history.js)_

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
