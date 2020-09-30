const { usePlugin } = require('@nomiclabs/buidler/config')

usePlugin("@nomiclabs/buidler-ganache")
usePlugin('@nomiclabs/buidler-truffle5')

module.exports = {
  networks: {
    // Local development network using ganache. You can set any of the
    // Ganache's options. All of them are supported, with the exception
    // of accounts.
    // https://github.com/trufflesuite/ganache-core#options
    ganache: {
      url: 'http://localhost:8545',
      gasLimit: 6000000000,
      defaultBalanceEther: 100
    },
  },
  solc: {
    version: '0.5.16',
    optimizer: {
      enabled: true,
      // Align all tokens to have the same optimization settings, to rule out any differences.
      // Note that the actually deployed tokens usually use 200 (only UNI uses 999999)
      runs: 999999,
    },
  },
}
