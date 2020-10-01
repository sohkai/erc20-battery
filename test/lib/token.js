const { bn, MAX_UINT256, ONE } = require('./number')

function runInstrumentedTokenTests(name, initialize, [_, minter, holder, delegator]) {
  return new Promise(resolve => {
    const results = []

    context(name, () => {
      let testPrefix
      let token

      async function instrumentTokenCall(test, call) {
        const { receipt: { gasUsed } } = await call()

        results.push([`${testPrefix}:${test.title}`, gasUsed])
      }

      function instrumentedTests() {
        it('transfers', async function () {
          await instrumentTokenCall(this.test, () => token.transfer(holder, ONE, { from: minter }))
        })

        it('transfers-all', async function () {
          const minterBal = await token.balanceOf(minter)
          await instrumentTokenCall(this.test, () => token.transfer(holder, minterBal, { from: minter }))
        })

        it('approves', async function () {
          await instrumentTokenCall(this.test, () => token.approve(holder, ONE, { from: minter }))
        })

        it('transferFroms', async function () {
          await token.approve(holder, ONE, { from: minter })
          await instrumentTokenCall(this.test, () => token.transferFrom(minter, holder, ONE, { from: holder }))
        })

        it('transferFroms-dust', async function () {
          await token.approve(holder, ONE.mul(bn(2)), { from: minter })
          await instrumentTokenCall(this.test, () => token.transfer(holder, ONE, { from: minter }))
        })

        it('transferFroms-infinity-allowance', async function () {
          await token.approve(holder, MAX_UINT256, { from: minter })
          await instrumentTokenCall(this.test, () => token.transferFrom(minter, holder, ONE, { from: holder }))
        })

        it('transferFroms-all', async function () {
          const minterBal = await token.balanceOf(minter)
          await token.approve(holder, minterBal, { from: minter })
          await instrumentTokenCall(this.test, () => token.transfer(holder, minterBal, { from: minter }))
        })
      }

      beforeEach(async () => {
        token = await initialize(minter, holder, delegator)
      })

      context('to new account', () => {
        before(() => {
          testPrefix = 'new'
        })

        instrumentedTests()
      })

      context('to existing account', () => {
        before(() => {
          testPrefix = 'prevbal'
        })

        beforeEach(async () => {
          await token.transfer(holder, ONE, { from: minter })
        })

        instrumentedTests()
      })

      after(() => {
        resolve(results)
      })
    })
  })
}

module.exports = runInstrumentedTokenTests
