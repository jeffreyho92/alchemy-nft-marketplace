const { frontEndAbiFolder } = require("../helper-hardhat.config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        var arrContract = ["NFT", "NFTMarketplace"]
        for (let i = 0; i < arrContract.length; i++) {
            const contractName = arrContract[i]
            await updateContractAddresses(contractName)
            await updateAbi(contractName)
        }
        console.log("Front end written!")
    }
}

async function updateAbi(contractName) {
    const file = fs.readFileSync(
        `./artifacts/contracts/${contractName}.sol/${contractName}.json`,
        "utf8"
    )
    const json = JSON.parse(file)
    const abi = JSON.stringify(json.abi)
    const filename = frontEndAbiFolder + contractName + "-abi.json"
    fs.writeFileSync(filename, abi)
}

async function updateContractAddresses(contractName) {
    const filename = frontEndAbiFolder + contractName + "-contractAddresses.json"
    const NFTMarketplace = await ethers.getContract(contractName)
    const contractAddresses = JSON.parse(fs.readFileSync(filename, "utf8"))
    contractAddresses[network.config.chainId.toString()] = [NFTMarketplace.address]
    fs.writeFileSync(filename, JSON.stringify(contractAddresses))
}
module.exports.tags = ["frontend"]
