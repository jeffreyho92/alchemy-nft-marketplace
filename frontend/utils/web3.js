import Web3 from "web3"
import {
    NFT_contractAddresses,
    NFT_abi,
    NFTMarketplace_contractAddresses,
    NFTMarketplace_abi,
    etherscanWebUrl,
} from "../constants"

export const connectWeb3 = async () => {
    var result = null

    if (window.ethereum) {
        var web3 = new Web3(window.ethereum)
        var chainId = await web3.eth.getChainId()
        // console.log("chainId", chainId)
        var contractNFTAdd =
            chainId in NFT_contractAddresses ? NFT_contractAddresses[chainId][0] : null
        var contractNFT = new web3.eth.Contract(NFT_abi, contractNFTAdd)
        var contractNFTMarketplaceAdd =
            chainId in NFTMarketplace_contractAddresses
                ? NFTMarketplace_contractAddresses[chainId][0]
                : null
        var contractNFTMarketplace = new web3.eth.Contract(
            NFTMarketplace_abi,
            contractNFTMarketplaceAdd
        )
        result = {
            web3,
            contractNFT,
            contractNFTMarketplace,
        }

        window.ethereum.on("accountsChanged", function (accounts) {
            window.location.reload()
        })
        window.ethereum.on("networkChanged", function (accounts) {
            window.location.reload()
        })
    } else {
        console.log("Please install MetaMask")
    }

    return result
}

export const connectNFTContract = async (nftAddress) => {
    var result = null

    if (window.ethereum) {
        var web3 = new Web3(window.ethereum)
        result = new web3.eth.Contract(NFT_abi, nftAddress)
    } else {
        console.log("Please install MetaMask")
    }
    return result
}
