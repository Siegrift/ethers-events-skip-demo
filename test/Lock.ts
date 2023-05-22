import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('Lock', function () {
  it('should work with on chain listeners', async () => {
    const Lock = await ethers.getContractFactory('Lock')
    const lock = await Lock.deploy()
    const requestsToMake = 20

    let received = 0
    lock.on(lock.filters.TestEvent(), (event) => {
      console.log('Received', event.transactionHash)
      received++
    })

    await new Promise((res) => setTimeout(res, 5_000)) // Wait until the listener is registered

    for (let i = 0; i < requestsToMake; i++) {
      const tx = await lock.emitEvent()
      console.log('Created', tx.hash)
    }

    await new Promise((res) => setTimeout(res, 5_000)) // Should be more then enough time for all events to be processed
    expect(received).to.equal(requestsToMake)
  })

  it('should work with getLogs', async () => {
    const Lock = await ethers.getContractFactory('Lock')
    const lock = await Lock.deploy()
    const requestsToMake = 20

    for (let i = 0; i < requestsToMake; i++) {
      const tx = await lock.emitEvent()
      console.log('Created', tx.hash)
    }

    await new Promise((res) => setTimeout(res, 5_000)) // Should be more then enough time for all events to be processed

    const events = await lock.provider.getLogs(lock.filters.TestEvent())
    console.log(
      'Received',
      events.map((e) => e.transactionHash),
    )
    expect(events.length).to.equal(requestsToMake)
  })

  it('should work with queryFilter', async () => {
    const Lock = await ethers.getContractFactory('Lock')
    const lock = await Lock.deploy()
    const requestsToMake = 20

    for (let i = 0; i < requestsToMake; i++) {
      const tx = await lock.emitEvent()
    }

    await new Promise((res) => setTimeout(res, 5_000)) // Should be more then enough time for all events to be processed

    const events = await lock.queryFilter(lock.filters.TestEvent())
    console.log(
      'Received',
      events.map((e) => e.transactionHash),
    )
    expect(events.length).to.equal(requestsToMake)
  })
})
