import React, { useState, useEffect } from "react"
import { connectWeb3, connectNFTContract } from "../../utils/web3"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import { selectAuthState, setAuthState } from "../../store/authSlice"

// import { GET_LISTED_ITEM_BY_NFT_ID } from "../../constants/subgraphQueries"
// import { apolloClient } from "../../utils/ApolloClient"

export default function SellNFT_existing() {
    const router = useRouter()
    const authState = useSelector(selectAuthState)
    const [formParams, updateFormParams] = useState({ nftAddress: "", tokenId: "", price: "" })
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [web3, setWeb3] = useState(null)
    // const [contractNFT, setContractNFT] = useState(null)
    const [contractNFTMarketplace, setContractNFTMarketplace] = useState(null)
    const [listPrice, setListPrice] = useState("")

    useEffect(async () => {
        var result = await connectWeb3()
        if (result) {
            setWeb3(result.web3)
            // setContractNFT(result.contractNFT)
            setContractNFTMarketplace(result.contractNFTMarketplace)

            var listPrice = await result.contractNFTMarketplace.methods.s_listPrice().call()
            setListPrice(listPrice)
        }
    }, [])

    async function submitForm() {
        var msg = ""
        if (!formParams?.nftAddress || !formParams?.tokenId || !formParams?.price) {
            msg = "Please fill in the form!"
        }

        if (msg) {
            return setMessage(msg)
        }

        // check if listed
        var listedToken = null
        try {
            var listedToken = await contractNFTMarketplace.methods
                .getListing(formParams.nftAddress, formParams.tokenId)
                .call()
            // console.log("listedToken", listedToken)
            if (listedToken?.price && parseFloat(listedToken?.price) > 0) {
                return setMessage("NFT has listed!")
            }
        } catch (error) {
            console.log("error", error)
        }

        //initial nft contract from nft address
        var nftContract = await connectNFTContract(formParams.nftAddress)
        if (!nftContract) {
            return setMessage("NFT address invalid!")
        }

        //check is owner
        var isOwner = false
        try {
            var ownerOf = await nftContract.methods.ownerOf(formParams.tokenId).call()
            if (ownerOf?.toLowerCase() == authState.account?.toLowerCase()) {
                isOwner = true
            }
        } catch (error) {
            console.log("error", error)
        }

        console.log("isOwner", isOwner)
        if (!isOwner) {
            return setMessage("You are not the owner!")
        }

        await listNFT(nftContract)
    }

    async function listNFT(nftContract) {
        console.log("Going to pop wallet now to pay gas...")
        setLoading(true)

        //check getApproved
        var isApproved = false
        var getApproved = await nftContract.methods.getApproved(formParams.tokenId).call()
        // console.log("getApproved", getApproved)
        if (!getApproved || getApproved != contractNFTMarketplace._address) {
            setMessage("Granting permission of the NFT...")

            await nftContract.methods
                .approve(contractNFTMarketplace._address, formParams.tokenId)
                .send({ from: authState.account })
                .on("transactionHash", function (hash) {
                    // console.log("transactionHash: "+transactionHash);
                    setMessage("Granting... please wait.")
                })
                .on("error", function (error) {
                    console.log(error)
                    setMessage("")
                    setLoading(false)
                })
                .then(function (result) {
                    // console.log(result)
                    isApproved = true
                })
        } else {
            isApproved = true
        }

        console.log("isApproved", isApproved)
        if (!isApproved) {
            setLoading(false)
            return setMessage("No permission of the NFT!")
        }

        setMessage("Paying gas for listing...")

        var sellingPrice = web3?.utils?.toWei(formParams.price, "ether")
        await contractNFTMarketplace.methods
            .listItem(formParams.nftAddress, formParams.tokenId, sellingPrice)
            .send({ from: authState.account, value: listPrice })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Listing... please wait.")
            })
            // .on('receipt', function(receipt){
            //    console.log('receipt', receipt)
            // })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Listed successfully")
                router.push("/profile")
            })
    }

    return (
        <>
            <h3 className="text-center font-bold text-purple-500 mb-8">
                Choose existing NFT to the marketplace
            </h3>
            <div className="mb-4">
                <label
                    className="block text-purple-500 text-sm font-bold mb-2"
                    htmlFor="nftAddress"
                >
                    NFT Address
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="nftAddress"
                    type="text"
                    placeholder="0xdfa....c04c"
                    onChange={(e) =>
                        updateFormParams({ ...formParams, nftAddress: e.target.value })
                    }
                    value={formParams.nftAddress}
                ></input>
            </div>
            <div className="mb-4">
                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="tokenId">
                    Token Id
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="tokenId"
                    type="text"
                    placeholder="1"
                    onChange={(e) => updateFormParams({ ...formParams, tokenId: e.target.value })}
                    value={formParams.tokenId}
                ></input>
            </div>
            <div className="mb-6">
                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">
                    Selling Price (in Ether)
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="number"
                    placeholder="Min 0.01 Ether"
                    step="0.01"
                    value={formParams.price}
                    onChange={(e) => updateFormParams({ ...formParams, price: e.target.value })}
                ></input>
            </div>
            <div className="mb-6">
                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">
                    Listing Price
                </label>
                {listPrice ? web3?.utils?.fromWei(listPrice, "ether") : ""} Ether
            </div>
            <div className="text-green text-center">{message}</div>
            {!loading && (
                <button
                    onClick={submitForm}
                    className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
                >
                    Select NFT
                </button>
            )}
        </>
    )
}
