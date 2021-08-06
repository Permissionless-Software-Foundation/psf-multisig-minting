/*
  Mock data for the ipfs-coord.unit.js unit tests.
*/

const peers = [
  'QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN',
  'QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v'
]

const peerData = {
  QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN: {
    apiName: 'ipfs-coord-announce',
    apiVersion: '1.3.2',
    apiInfo: 'https://ipfs-service-provider.fullstack.cash/',
    ipfsId: 'QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN',
    type: 'node.js',
    ipfsMultiaddrs: [
      '/ip4/127.0.0.1/tcp/5668/p2p/QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN',
      '/ip4/127.0.0.1/tcp/5669/ws/p2p/QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN',
      '/ip4/172.17.0.4/tcp/5668/p2p/QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN',
      '/ip4/172.17.0.4/tcp/5669/ws/p2p/QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN'
    ],
    orbitdb:
      '/orbitdb/zdpuB2H7Eqv63qWnEisR9SkW71h1GHTu32xdvza4gjBtD9AD8/QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN21072122',
    circuitRelays: [],
    isCircuitRelay: false,
    cryptoAddresses: [
      {
        blockchain: 'BCH',
        type: 'cashAddr',
        address: 'bitcoincash:qq4pk63gngzxnnhne39n0sl7kn2ekhnxngm5fyrgyd'
      },
      {
        blockchain: 'BCH',
        type: 'slpAddr',
        address: 'simpleledger:qq4pk63gngzxnnhne39n0sl7kn2ekhnxngh0zlkg6n'
      }
    ],
    encryptPubKey:
      '037676cdeac8376a75c19f62b40aa06feebc788a6704e1a1d13dcf478d090d7205',
    jsonLd: {
      '@context': 'https://schema.org/',
      '@type': 'WebAPI',
      name: 'ipfs-bch-wallet-service-dsl',
      description:
        'IPFS service providing BCH blockchain access needed by a wallet.',
      documentation: 'https://ipfs-bch-wallet-service.fullstack.cash/',
      provider: {
        '@type': 'Organization',
        name: 'Permissionless Software Foundation',
        url: 'https://PSFoundation.cash'
      },
      identifier: 'QmQqjVVD3CS6zaJmoSdt6GwX1c1tD5T9FZas4qxLbru8xN'
    },
    updatedAt: '2021-08-05T22:20:13.502Z'
  },
  QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v: {
    apiName: 'ipfs-coord-announce',
    apiVersion: '1.3.2',
    apiInfo: 'https://ipfs-bch-wallet-service.fullstack.cash/',
    ipfsId: 'QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v',
    type: 'node.js',
    ipfsMultiaddrs: [
      '/ip4/127.0.0.1/tcp/5701/p2p/QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v',
      '/ip4/127.0.0.1/tcp/5702/ws/p2p/QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v',
      '/ip4/192.168.0.2/tcp/5701/p2p/QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v',
      '/ip4/192.168.0.2/tcp/5702/ws/p2p/QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v'
    ],
    orbitdb:
      '/orbitdb/zdpuB3YnmmspCrmwNtHnNiPvhwma1raz7iWXFG2uXUzSfPfps/QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v21080518',
    circuitRelays: [],
    isCircuitRelay: false,
    cryptoAddresses: [
      {
        blockchain: 'BCH',
        type: 'cashAddr',
        address: 'bitcoincash:qpvphp48um3t0vjft59z3n2cdwal52vfauvpwtxqe4'
      },
      {
        blockchain: 'BCH',
        type: 'slpAddr',
        address: 'simpleledger:qpvphp48um3t0vjft59z3n2cdwal52vfauq69snq8t'
      }
    ],
    encryptPubKey:
      '031658369d6eb6f7e83682f6434a349cfa1799836fd967f348da612ad49948dcd5',
    jsonLd: {
      '@context': 'https://schema.org/',
      '@type': 'WebAPI',
      name: 'trout-bch-wallet-service-dev',
      version: '1.9.1',
      protocol: 'bch-wallet',
      description:
        'IPFS service providing BCH blockchain access needed by a wallet.',
      documentation: 'https://ipfs-bch-wallet-service.fullstack.cash/',
      provider: {
        '@type': 'Organization',
        name: 'Permissionless Software Foundation',
        url: 'https://PSFoundation.cash'
      },
      identifier: 'QmZSyLnRQWMBknVNjUroLQnrcmDnUVAUU4pMQ2LGhh6b9v'
    },
    updatedAt: '2021-08-06T00:30:39.495Z'
  }
}

module.exports = {
  peers,
  peerData
}
