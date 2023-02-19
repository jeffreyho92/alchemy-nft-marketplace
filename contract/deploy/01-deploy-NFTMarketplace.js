const { network, ethers } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat.config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    const arguments = []
    // console.log("arguments", arguments)
    const NFTMarketplace = await deploy("NFTMarketplace", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(NFTMarketplace.address, arguments)
    }
    console.log("NFTMarketplace.address", NFTMarketplace.address)
    const arguments2 = [NFTMarketplace.address]
    // console.log("arguments2", arguments2)
    const NFT = await deploy("NFT", {
        from: deployer,
        args: arguments2,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(NFT.address, arguments2)
    }

    log("----------------------------------------------------")
}

module.exports.tags = ["all", "nft"]
