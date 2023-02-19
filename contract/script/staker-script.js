const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const accounts = await ethers.getSigners() // could also do with getNamedAccounts
    const owner = accounts[0]
    const contract = await ethers.getContract("Staker")

    // top up contract to pay interest
    console.log("top up", contract.address)
    await owner.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("10"),
        gasLimit: "1500000",
    })

    // await ethers.provider.send("evm_increaseTime", [50])
    // await ethers.provider.send("evm_mine")
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
