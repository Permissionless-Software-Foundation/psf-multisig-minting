// Mocks for msg-read command

const transactionData = [
  {
    txid: '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
    hash: '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
    version: 2,
    size: 305,
    locktime: 0,
    vin: [],
    vout: [
      {
        value: 0.00004418,
        n: 0,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 08fbdcf750882c6766cdfb196eb03f4167df41c1 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91408fbdcf750882c6766cdfb196eb03f4167df41c188ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qqy0hh8h2zyzcemxeha3jm4s8aqk0h6pcytgyml2m5']
        }
      },
      {
        value: 0,
        n: 1,
        scriptPubKey: {
          asm:
            'OP_RETURN -21101 4d53472049504653207a647075417463334b5337636273456f7359614861575175544e3178745a4770695139626a7a464e636438514658527263207073664d736733',
          hex:
            '6a026dd2424d53472049504653207a647075417463334b5337636273456f7359614861575175544e3178745a4770695139626a7a464e636438514658527263207073664d736733',
          type: 'nulldata'
        }
      },
      {
        value: 0.00000546,
        n: 2,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 709355aef902ab5648d12c0efe67f0acaff3df28 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914709355aef902ab5648d12c0efe67f0acaff3df2888ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qpcfx4dwlyp2k4jg6ykqaln87zk2lu7l9qaxu5g8ns']
        }
      }
    ],
    hex:
      '0200000001f3ae5a0aeaf128263639be2b38d0149a6df4cde0808caf13f0639ef871e890cb030000006a47304402202e8fea11722f7d1486855ddd3cf1b39af388cea90c9a465ce3aa3dc324b8c31802204d141ef30db8efe0edcff7877b4fe23d4f430a63cf71e7e17c5a728d7020fe7c4121039cb0606b76224c8fab62e8b8a8a56ebc41ff020ab8827a1d33ddbbff21049530ffffffff0342110000000000001976a91408fbdcf750882c6766cdfb196eb03f4167df41c188ac0000000000000000476a026dd2424d53472049504653207a647075417463334b5337636273456f7359614861575175544e3178745a4770695139626a7a464e636438514658527263207073664d73673322020000000000001976a914709355aef902ab5648d12c0efe67f0acaff3df2888ac00000000',
    blockhash:
      '0000000000000000017f553e1e392a75792862de55ed12624bb093adbc28439d',
    confirmations: 417,
    time: 1641443093,
    blocktime: 1641443093
  }
]

const transactionData2 = [
  {
    txid: '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
    hash: '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
    version: 2,
    size: 305,
    locktime: 0,
    vin: [],
    vout: [
      {
        value: 0.00004418,
        n: 0,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 08fbdcf750882c6766cdfb196eb03f4167df41c1 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91408fbdcf750882c6766cdfb196eb03f4167df41c188ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qqy0hh8h2zyzcemxeha3jm4s8aqk0h6pcytgyml2m5']
        }
      },
      {
        value: 0.00000546,
        n: 2,
        scriptPubKey: {
          asm:
            'OP_DUP OP_HASH160 709355aef902ab5648d12c0efe67f0acaff3df28 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914709355aef902ab5648d12c0efe67f0acaff3df2888ac',
          reqSigs: 1,
          type: 'pubkeyhash',
          addresses: ['bitcoincash:qpcfx4dwlyp2k4jg6ykqaln87zk2lu7l9qaxu5g8ns']
        }
      }
    ],
    hex:
      '0200000001f3ae5a0aeaf128263639be2b38d0149a6df4cde0808caf13f0639ef871e890cb030000006a47304402202e8fea11722f7d1486855ddd3cf1b39af388cea90c9a465ce3aa3dc324b8c31802204d141ef30db8efe0edcff7877b4fe23d4f430a63cf71e7e17c5a728d7020fe7c4121039cb0606b76224c8fab62e8b8a8a56ebc41ff020ab8827a1d33ddbbff21049530ffffffff0342110000000000001976a91408fbdcf750882c6766cdfb196eb03f4167df41c188ac0000000000000000476a026dd2424d53472049504653207a647075417463334b5337636273456f7359614861575175544e3178745a4770695139626a7a464e636438514658527263207073664d73673322020000000000001976a914709355aef902ab5648d12c0efe67f0acaff3df2888ac00000000',
    blockhash:
      '0000000000000000017f553e1e392a75792862de55ed12624bb093adbc28439d',
    confirmations: 417,
    time: 1641443093,
    blocktime: 1641443093
  }
]

const hashData = {
  isValid: true,
  appId: 'psf-bch-wallet',
  createdAt: 1641442447608,
  _id: '61d66c8f81decd001312233a',
  hash: 'zdpuAtc3KS7cbsEosYaHaWQuTN1xtZGpiQ9bjzFNcd8QFXRrc',
  key: 'cb90e871f89e63f013af8c80e0cdf46d9a14d0382bbe39362628f1ea0a5aaef3',
  value: {
    message: '2022-01-06T04:13:58.934Z',
    signature:
      'ILFVEXAkZ8n3vYtFRerS5FgysDPvDnyNSAL7n0kxKXATTKtldMhP0tuwT5mBQYHtg52KP91mVZvvbmLHJHaO4OU=',
    data:
      '{"appId":"psf-bch-wallet","data":{"now":"2022-01-06T04:13:55.198Z","data":"04323c8f6b936b90d1a2cfd2d4ccf2511803b2c516dcd5e6b18010e52c510e7f2526ac5c0db8f0afad384e73df4412212c46e96a2a37e1d177249920ace55b84ef245628fac32d1f5715af6d1213d0a4692b4bac9deec30462105ecf40eba1bc7ae3a140cde69f7e3595d386488f8416349048376aebfd220bac52a14a845f1608"},"timestamp":"2022-01-06T04:13:58.934Z","localTimeStamp":"6/1/2022 12:13:58 a. m."}'
  },
  __v: 0
}

class Read {
  getByHash () {
    return hashData
  }
}

const decryptedMsgHex = '6d73677465737433'

module.exports = {
  transactionData,
  transactionData2,
  decryptedMsgHex,
  Read,
  hashData
}
