import React, { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { useRouter } from "next/router"
import { connectWeb3, connectNFTContract } from "../utils/web3"
import { selectAuthState, setAuthState } from "../store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { checkIPFSurl } from "../utils/helper"

export default function NFTPage(props) {
    const [data, updateData] = useState({})
    const [message, setMessage] = useState("")
    const [web3, setWeb3] = useState(null)
    const [formParams, updateFormParams] = useState({ newPrice: "" })
    const [loading, setLoading] = useState(false)
    const [listPrice, setListPrice] = useState("")

    // const [contractNFT, setContractNFT] = useState(null)
    const [contractNFTMarketplace, setContractNFTMarketplace] = useState(null)
    const authState = useSelector(selectAuthState)
    const [nftContract, setNftContract] = useState(null)

    const router = useRouter()
    const { nftAddress, tokenId } = router.query

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

    useEffect(async () => {
        initial()
    }, [contractNFTMarketplace])

    const initial = async () => {
        if (!contractNFTMarketplace) return

        var listedToken = null
        try {
            var listedToken = await contractNFTMarketplace.methods
                .getListing(nftAddress, tokenId)
                .call()
            // console.log("listedToken", listedToken)
        } catch (error) {
            console.log("error", error)
        }

        if (listedToken) {
            //initial nft contract from nft address
            var nftContract = await connectNFTContract(nftAddress)
            if (!nftContract) {
                return setMessage("NFT address invalid!")
            } else {
                setNftContract(nftContract)
            }

            // var tokenId = listedToken.tokenId;
            var tokenURI = await nftContract.methods.tokenURI(tokenId).call()
            if (tokenURI) {
                tokenURI = checkIPFSurl(tokenURI)
            }

            // const res = await fetch("/api/downloadURI", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ tokenURI }),
            // })
            // const meta = (resBody.success && resBody.response) ? resBody.response : {} ;

            const res = await fetch(tokenURI, {
                method: "GET",
                // headers: { 'Accept': 'text/plain' },
            })
            const resBody = await res.json()
            const meta = resBody || {}

            //check owner
            var ownerOf = await nftContract.methods.ownerOf(tokenId).call()

            updateData({
                tokenId: tokenId,
                seller: listedToken.seller,
                nftAddress: listedToken.nftAddress,
                owner: ownerOf,
                image: meta.image ? checkIPFSurl(meta.image) : "",
                name: meta.name,
                price: listedToken.price > 0 ? listedToken.price : null,
                description: meta.description,
            })
        }
    }

    async function submitListing() {
        var msg = ""
        if (!formParams?.newPrice) {
            msg = "Please fill in the form!"
        }

        if (msg) {
            return setMessage(msg)
        }
        setLoading(true)

        // check if listed
        var listedToken = null
        try {
            var listedToken = await contractNFTMarketplace.methods
                .getListing(nftAddress, tokenId)
                .call()
            // console.log("listedToken", listedToken)
            if (listedToken?.price && parseFloat(listedToken?.price) > 0) {
                return setMessage("NFT has listed!")
            }
        } catch (error) {
            console.log("error", error)
        }

        //check is owner
        var isOwner = false
        try {
            var ownerOf = await nftContract.methods.ownerOf(tokenId).call()
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

        //check getApproved
        var isApproved = false
        var getApproved = await nftContract.methods.getApproved(tokenId).call()
        // console.log("getApproved", getApproved)
        if (!getApproved || getApproved != contractNFTMarketplace._address) {
            setMessage("Granting permission of the NFT...")

            await nftContract.methods
                .approve(contractNFTMarketplace._address, tokenId)
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

        // console.log("isApproved", isApproved)
        if (!isApproved) {
            setLoading(false)
            return setMessage("No permission of the NFT!")
        }

        setMessage("Paying gas fees...")

        console.log("Going to pop wallet now to pay gas...")
        var sellingPrice = web3?.utils?.toWei(formParams.newPrice, "ether")
        await contractNFTMarketplace.methods
            .listItem(nftContract._address, tokenId, sellingPrice)
            .send({ from: authState.account, value: listPrice })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Updating... please wait.")
            })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Updated successfully")
                router.reload(window.location.pathname)
            })
    }

    async function submitUpdate() {
        var msg = ""
        if (!formParams?.newPrice) {
            msg = "Please fill in the form!"
        }

        if (msg) {
            return setMessage(msg)
        }
        setLoading(true)
        setMessage("Paying gas fees...")

        console.log("Going to pop wallet now to pay gas...")
        var sellingPrice = web3?.utils?.toWei(formParams.newPrice, "ether")
        await contractNFTMarketplace.methods
            .updateListing(nftAddress, tokenId, sellingPrice)
            .send({ from: authState.account })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Updating... please wait.")
            })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Updated successfully")
                router.reload(window.location.pathname)
            })
    }

    async function submitCancel() {
        setLoading(true)
        setMessage("Paying gas fees...")

        console.log("Going to pop wallet now to pay gas...")
        await contractNFTMarketplace.methods
            .cancelListing(nftAddress, tokenId)
            .send({ from: authState.account })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Updating... please wait.")
            })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Updated successfully")
                router.reload(window.location.pathname)
            })
    }

    async function submitBuy() {
        setLoading(true)
        setMessage("Paying gas fees...")

        console.log("Going to pop wallet now to pay gas...")
        await contractNFTMarketplace.methods
            .buyItem(nftAddress, tokenId)
            .send({ from: authState.account, value: data.price })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Updating... please wait.")
            })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Updated successfully")
                router.reload(window.location.pathname)
            })
    }

    var youAreOwner =
        authState?.account?.toLowerCase() == data?.owner?.toLowerCase() ||
        authState?.account?.toLowerCase() == data?.seller?.toLowerCase()
    var isListed = data.price && parseFloat(data.price) > 0
    return (
        <div>
            <Navbar></Navbar>
            {authState?.account && (
                <div className="flex ml-20 mt-20">
                    <img src={data.image} alt="" className="w-2/5 shadow-2xl rounded-lg border-2" />
                    <div className="text-xl w-2/5 ml-20 space-y-8 text-white">
                        <div>Name: {data.name}</div>
                        <div>Description: {data.description}</div>
                        {isListed ? (
                            <div>
                                Price:{" "}
                                <span className="">
                                    {web3?.utils?.fromWei(data?.price?.toString() || "0", "ether")}{" "}
                                    Ether
                                </span>
                            </div>
                        ) : (
                            <div className="text-emerald-700">NFT not listed!</div>
                        )}
                        {/* <div>
                            Owner: <span className="text-sm">{data.owner}</span>
                        </div> */}
                        {youAreOwner && (
                            <div className="text-emerald-700">You are the owner of this NFT</div>
                        )}
                        {isListed && !youAreOwner && !loading && (
                            <button
                                onClick={submitBuy}
                                className="enableEthereumButton w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Buy this NFT
                            </button>
                        )}
                        {youAreOwner && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2" htmlFor="price">
                                    Selling Price (in Ether)
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="number"
                                    placeholder="Min 0.01 Ether"
                                    step="0.01"
                                    value={formParams.newPrice}
                                    onChange={(e) =>
                                        updateFormParams({
                                            ...formParams,
                                            newPrice: e.target.value,
                                        })
                                    }
                                ></input>
                            </div>
                        )}
                        {isListed && youAreOwner && !loading && (
                            <>
                                <button
                                    onClick={submitUpdate}
                                    className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
                                >
                                    Update Listing
                                </button>
                                <button
                                    onClick={submitCancel}
                                    className="font-bold mt-10 w-full bg-red-500 text-white rounded p-2 shadow-lg"
                                >
                                    Cancel Listing
                                </button>
                            </>
                        )}
                        {!isListed && youAreOwner && !loading && (
                            <button
                                onClick={submitListing}
                                className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
                            >
                                Submit Listing
                            </button>
                        )}
                        <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            )}
        </div>
    )
}
