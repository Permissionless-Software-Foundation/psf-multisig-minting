// Mocks for msg-send command
const getPubkeyResult = {
  success: true,
  status: 200,
  endpoint: 'pubkey',
  pubkey: {
    success: true,
    publicKey: '0337d09a94e10df1a1bd29d523cd496eca4da5c0cdaf0f66aa8871f5d1f9024bcf'
  }
}
const getPubkeyErrorResult = {
  success: false,
  status: 422,
  message: 'No transaction history.',
  endpoint: 'pubkey'
}

class Write {
  postEntry () {
    return { hash: 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu' }
  }
}
module.exports = {
  getPubkeyResult,
  getPubkeyErrorResult,
  Write
}
