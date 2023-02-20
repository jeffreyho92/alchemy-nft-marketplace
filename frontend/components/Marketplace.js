import React, { useState, useEffect } from "react"
import Navbar from "./Navbar"
import NFTTile from "./NFTTile"
import { connectWeb3, connectNFTContract } from "../utils/web3"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import { checkIPFSurl } from "../utils/helper"
import { selectAuthState, setAuthState } from "../store/authSlice"
import { useDispatch, useSelector } from "react-redux"

export default function Marketplace() {
    // const sampleData = [
    //     {
    //         "name": "NFT#1",
    //         "description": "Alchemy's First NFT",
    //         "website":"http://axieinfinity.io",
    //         "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
    //         "price":"0.03ETH",
    //         "currentlySelling":"True",
    //         "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    //     },
    //     {
    //         "name": "NFT#2",
    //         "description": "Alchemy's Second NFT",
    //         "website":"http://axieinfinity.io",
    //         "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
    //         "price":"0.03ETH",
    //         "currentlySelling":"True",
    //         "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    //     },
    //     {
    //         "name": "NFT#3",
    //         "description": "Alchemy's Third NFT",
    //         "website":"http://axieinfinity.io",
    //         "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
    //         "price":"0.03ETH",
    //         "currentlySelling":"True",
    //         "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    //     },
    // ];
    const [data, updateData] = useState([])
    // const [contractNFT, setContractNFT] = useState(null)
    // const [contractNFTMarketplace, setContractNFTMarketplace] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const authState = useSelector(selectAuthState)

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)
    // console.log("listedNfts", listedNfts)

    useEffect(async () => {
        // var result = await connectWeb3()
        // if (result) {
        //     // setWeb3(result.web3);
        //     // setContractNFT(result.contractNFT)
        //     // setContractNFTMarketplace(result.contractNFTMarketplace)
        // }
    }, [])

    useEffect(async () => {
        initial()
        // }, [contractNFTMarketplace])
    }, [listedNfts])

    const initial = async () => {
        if (!listedNfts) return
        // var arrAllNFT = await contractNFTMarketplace.methods.getAllNFTs().call();

        var arrNFT = []
        var arrAllNFT = listedNfts?.activeItems || []
        var maxLength = arrAllNFT?.length > 6 ? 6 : arrAllNFT?.length
        if (maxLength) {
            for (let i = 0; i < maxLength; i++) {
                var listedToken = arrAllNFT[i]
                var tokenId = listedToken.tokenId

                //initial nft contract from nft address
                // var tokenURI = await contractNFT.methods.tokenURI(tokenId).call()
                var nftContract = await connectNFTContract(listedToken.nftAddress)
                if (!nftContract) {
                    return console.log("NFT address invalid!")
                }
                var tokenURI = await nftContract.methods.tokenURI(tokenId).call()
                if (!tokenURI) {
                    continue
                } else {
                    tokenURI = checkIPFSurl(tokenURI)
                }

                // const res = await fetch("/api/downloadURI", {
                //     method: "POST",
                //     headers: {'Content-Type':'application/json'},
                //     body: JSON.stringify({ tokenURI }),
                // });
                // const meta = (resBody.success && resBody.response) ? resBody.response : {} ;

                const res = await fetch(tokenURI, {
                    method: "GET",
                    // headers: { 'Accept': 'text/plain' },
                })
                const resBody = await res.json()
                const meta = resBody || {}

                arrNFT.push({
                    tokenId: tokenId,
                    seller: listedToken.seller,
                    owner: listedToken.owner,
                    nftAddress: listedToken.nftAddress,
                    image: meta.image,
                    name: meta.name,
                    price: meta.price,
                    description: meta.description,
                })
            }
        }
        updateData(arrNFT)
        setLoaded(true)
    }

    return (
        <div>
            <Navbar></Navbar>
            {authState.account && (
                <div className="flex flex-col place-items-center mt-20">
                    <div className="md:text-xl font-bold text-white">Top NFTs</div>
                    <div className="flex mt-5 justify-center flex-wrap max-w-screen-xl text-center text-white">
                        {loaded ? (
                            data.map((value, index) => {
                                return <NFTTile data={value} key={index}></NFTTile>
                            })
                        ) : (
                            <span>Loading...</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
