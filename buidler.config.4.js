// Solc 4 buidler configuration for ANTv1
module.exports = {
  solc: {
    version: "0.4.8",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {
    sources: "./contracts/4",
  }
}
