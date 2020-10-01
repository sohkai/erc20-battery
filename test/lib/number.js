const { toBN } = require('web3-utils')

function bn(x) {
  return toBN(x)
}

function bigExp(x, y) {
  return bn(x).mul(bn(10).pow(bn(y)))
}

function maxUint(e) {
  return bn(2).pow(bn(e)).sub(bn(1))
}

const ONE = bigExp(1, 18)
const MAX_UINT256 = maxUint(256)

module.exports = {
  bn,
  ONE,
  MAX_UINT256,
}
