import React, { useState, useEffect } from "react"
import Navbar from "./Navbar"
import NFTTile from "./NFTTile"
import { connectWeb3, connectNFTContract } from "../utils/web3"
import { checkIPFSurl } from "../utils/helper"
import { selectAuthState, setAuthState } from "../store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { etherscanWebUrl } from "../constants"
import { GET_LISTED_ITEM_BY_SELLER, GET_LISTED_ITEM_BY_BUYER } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import { useRouter } from "next/router"

export default function Profile() {
    const [data, updateData] = useState([])
    const [totalPrice, updateTotalPrice] = useState(0)
    const authState = useSelector(selectAuthState)
    const [web3, setWeb3] = useState(null)
    // const [contractNFT, setContractNFT] = useState(null)
    const [contractNFTMarketplace, setContractNFTMarketplace] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const [proceedBalance, setProceedBalance] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const {
        loading1,
        error1,
        data: myNFTs1,
    } = useQuery(GET_LISTED_ITEM_BY_SELLER, {
        variables: { account: authState?.account },
    })
    // console.log("myNFTs1", myNFTs1)
    const {
        loading2,
        error2,
        data: myNFTs2,
    } = useQuery(GET_LISTED_ITEM_BY_BUYER, {
        variables: { account: authState?.account },
    })
    // console.log("myNFTs2", myNFTs2)

    useEffect(async () => {
        var result = await connectWeb3()
        if (result) {
            setWeb3(result.web3)
            // setContractNFT(result.contractNFT)
            setContractNFTMarketplace(result.contractNFTMarketplace)
        }
    }, [])

    useEffect(async () => {
        initial()
    }, [contractNFTMarketplace, myNFTs1, myNFTs2])

    const initial = async () => {
        if (!contractNFTMarketplace || !authState.account || !myNFTs1 || !myNFTs2) return

        var tolPrice = 0
        var arrNFT = []
        //   var arrMyNFT = await contractNFTMarketplace.methods.getMyNFTs().call({from: authState.account});
        var arrMyNFT = []
        if (myNFTs1?.activeItems) {
            arrMyNFT = arrMyNFT.concat(myNFTs1.activeItems)
        }
        if (myNFTs2?.activeItems) {
            arrMyNFT = arrMyNFT.concat(myNFTs2.activeItems)
        }

        // console.log("arrMyNFT", arrMyNFT)
        if (arrMyNFT?.length) {
            for (let i = 0; i < arrMyNFT.length; i++) {
                var listedToken = arrMyNFT[i]
                var tokenId = listedToken.tokenId

                //initial nft contract from nft address
                // var tokenURI = await contractNFT.methods.tokenURI(tokenId).call()
                var nftContract = await connectNFTContract(listedToken.nftAddress)
                if (!nftContract) {
                    return setMessage("NFT address invalid!")
                }
                var tokenURI = await nftContract.methods.tokenURI(tokenId).call()
                if (!tokenURI) {
                    continue
                } else {
                    tokenURI = checkIPFSurl(tokenURI)
                }

                if (listedToken.price) {
                    tolPrice += parseFloat(listedToken.price)
                }

                // const res = await fetch("/api/downloadURI", {
                //     method: "POST",
                //     headers: {'Content-Type':'application/json'},
                //     body: JSON.stringify({ tokenURI }),
                // });
                // const meta = (resBody.success && resBody.response) ? resBody.response : {} ;

                var meta = {}
                try {
                    const res = await fetch(tokenURI, {
                        method: "GET",
                        // headers: { 'Accept': 'text/plain' },
                    })
                    const resBody = await res.json()
                    meta = resBody || {}
                } catch (error) {
                    console.log(error)
                }

                arrNFT.push({
                    tokenId: tokenId,
                    seller: listedToken.seller,
                    owner: listedToken.owner,
                    nftAddress: listedToken.nftAddress,
                    image: meta.image ? checkIPFSurl(meta.image) : "",
                    name: meta.name,
                    price: listedToken.price,
                    description: meta.description,
                })
            }
        }
        updateData(arrNFT)
        setLoaded(true)
        updateTotalPrice(tolPrice)

        var proceedBalance = await contractNFTMarketplace.methods
            .getProceeds(authState.account)
            .call()
        setProceedBalance(proceedBalance)
    }

    const submitWithdraw = async () => {
        setLoading(true)
        setMessage("Paying gas fees...")

        console.log("Going to pop wallet now to pay gas...")
        await contractNFTMarketplace.methods
            .withdrawProceeds()
            .send({ from: authState.account })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Withdrawing... please wait.")
            })
            .on("error", function (error) {
                console.log(error)
                setMessage("")
                setLoading(false)
            })
            .then(function (result) {
                // console.log(result)
                setMessage("Withdrawn successfully")
                router.reload(window.location.pathname)
            })
    }

    return (
        <div className="profileClass">
            <Navbar></Navbar>
            {authState.account && (
                <div className="profileClass">
                    <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                        <div className="mb-5">
                            <h2 className="font-bold">My Wallet</h2>
                            {authState?.account && (
                                <a href={etherscanWebUrl + authState?.account} target="_blank">
                                    {authState?.account}
                                </a>
                            )}
                        </div>
                        {proceedBalance && proceedBalance > 0 && (
                            <div className="mb-5">
                                {!loading && (
                                    <button
                                        onClick={submitWithdraw}
                                        className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                    >
                                        Withdraw Proceeded Balance
                                    </button>
                                )}
                                {message && (
                                    <div className="text-green text-center mt-3">{message}</div>
                                )}
                                <br />
                                {web3?.utils?.fromWei(
                                    proceedBalance?.toString() || "0",
                                    "ether"
                                )}{" "}
                                Ether
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                        <div>
                            <h2 className="font-bold">No. of NFTs</h2>
                            {data.length}
                        </div>
                        <div className="ml-20">
                            <h2 className="font-bold">Total Value</h2>
                            {web3?.utils?.fromWei(totalPrice?.toString() || "0", "ether")} Ether
                        </div>
                    </div>
                    <div className="flex flex-col text-center items-center mt-11 text-white">
                        <h2 className="font-bold">Your NFTs</h2>
                        <div className="flex justify-center flex-wrap max-w-screen-xl">
                            {data.map((value, index) => {
                                return <NFTTile data={value} key={index}></NFTTile>
                            })}
                        </div>
                        {authState.account && loaded && (
                            <div className="mt-10 text-xl">
                                {data.length == 0 ? "Oops, no NFT to display" : ""}
                            </div>
                        )}
                        {authState.account && !loaded && (
                            <div className="mt-10 text-xl">Loading...</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
