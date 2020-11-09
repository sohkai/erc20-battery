const Table = require('cli-table')
const { ZERO_ADDRESS } = require('./lib/address')
const { bn, MAX_UINT256, ONE } = require('./lib/number')
const runInstrumentedTokenTests = require('./lib/token')

const ANTv1 = artifacts.require('ANTv1')
const ANTv2 = artifacts.require('ANTv2')
const Comp = artifacts.require('Comp')
const Uni = artifacts.require('Uni')
const UniLpV2 = artifacts.require('UniLpV2')
const Yfi = artifacts.require('YFI')

const suite = [
  [
    'ANTv1',
    async (minter) => {
      const token = await ANTv1.new(ZERO_ADDRESS, { from: minter })
      await token.generateTokens(minter, ONE.mul(bn(10)), { from: minter })

      return token
    }
  ],
  [
    'ANTv2',
    async (minter) => {
      const token = await ANTv2.new(minter)
      await token.mint(minter, ONE.mul(bn(10)), { from: minter })

      return token
    }
  ],
  [
    'Comp',
    async (minter) => {
      return await Comp.new(minter)
    }
  ],
  [
    'Uni',
    async (minter) => {
      return await Uni.new(minter, minter, MAX_UINT256, { from: minter })
    }
  ],
  [
    'UniLpV2',
    async (minter) => {
      const token = await UniLpV2.new()
      await token.mint(minter, ONE.mul(bn(10)))

      return token
    }
  ],
  [
    'Yfi',
    async (minter) => {
      const token = await Yfi.new()
      await token.addMinter(minter)
      await token.mint(minter, ONE.mul(bn(10)), { from: minter })

      return token
    }
  ],
]

const delSuite = [
  [
    'Comp Del',
    async (minter, holder, del) => {
      const token = await Comp.new(minter)
      await token.delegate(holder, { from: minter })

      return token
    }
  ],
  [
    'Uni Del',
    async (minter, holder, del) => {
      const token = await Uni.new(minter, minter, MAX_UINT256, { from: minter })
      await token.delegate(holder, { from: minter })

      return token
    }
  ],
  [
    'Comp Del to',
    async (minter, holder, del) => {
      const token = await Comp.new(minter)
      await token.delegate(holder, { from: minter })
      await token.delegate(del, { from: holder })

      return token
    }
  ],
  [
    'Uni Del to',
    async (minter, holder, del) => {
      const token = await Uni.new(minter, minter, MAX_UINT256, { from: minter })
      await token.delegate(holder, { from: minter })
      await token.delegate(del, { from: holder })

      return token
    }
  ],
]

function displayResultsTable(results) {
  function parseRows(results) {
    const resultsByTest = results.reduce((byTest, [_, suiteResult]) => {
      for (const [test, res] of suiteResult) {
        const row = byTest[test] || []
        byTest[test] = [...row, res]
      }

      return byTest
    }, {})

    function highlightLowest(row) {
      const low = [...row].sort((a, b) => a - b)[0] // sort works in-place
      return row.map(val => {
        return val === low ? `${val} (*)` : val
      })
    }

    return Object.entries(resultsByTest).map(([name, row]) => ({ [name]: highlightLowest(row) }))
  }

  const table = new Table({ head: ["", ...results.map(([name]) => name)] })
  table.push(...parseRows(results))

  console.log(table.toString())
}

contract('Tokens', async (accounts) => {
  const results = await Promise.all(
    [suite, delSuite].map((suite) => {
      return Promise.all(suite.map(async ([name, initialize]) => {
        const results = await runInstrumentedTokenTests(name, initialize, accounts)

        return [name, results]
      }))
    })
  )

  after(() => {
    const [tokenResults, delResults] = results

    console.log('Tokens')
    displayResultsTable(tokenResults)

    console.log()
    console.log('Tokens with delegation enabled')
    displayResultsTable(delResults)
  })
})
