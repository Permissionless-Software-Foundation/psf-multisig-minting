// Mocks for msg-send command
const getPubkeyResult = {
  success: true,
  status: 200,
  endpoint: 'pubkey',
  pubkey: {
    success: true,
    publicKey: 'deedc4f82bb77d920b0c867aeaf7b410ee8d71cb76ac9367b8c6d624feff757b'
  }
}
const getPubkeyErrorResult = {
  success: false,
  status: 422,
  message: 'No transaction history.',
  endpoint: 'pubkey'
}
module.exports = {
  getPubkeyResult,
  getPubkeyErrorResult
}
