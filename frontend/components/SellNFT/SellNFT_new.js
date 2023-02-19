import React, { useState, useEffect } from "react"
import { connectWeb3 } from "../../utils/web3"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import { selectAuthState, setAuthState } from "../../store/authSlice"

export default function SellNFT_new() {
    const router = useRouter()
    const authState = useSelector(selectAuthState)
    const [formParams, updateFormParams] = useState({ name: "", description: "", price: "" })
    const [fileURL, setFileURL] = useState(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [web3, setWeb3] = useState(null)
    const [contractNFT, setContractNFT] = useState(null)
    const [contractNFTMarketplace, setContractNFTMarketplace] = useState(null)
    const [listPrice, setListPrice] = useState("")

    useEffect(async () => {
        var result = await connectWeb3()
        if (result) {
            setWeb3(result.web3)
            setContractNFT(result.contractNFT)
            setContractNFTMarketplace(result.contractNFTMarketplace)

            var listPrice = await result.contractNFTMarketplace.methods.s_listPrice().call()
            setListPrice(listPrice)
        }
    }, [])

    const handleFileInput = (e) => {
        // handle validations
        const file = e.target.files[0]
        if (file.size > 2 * 1024 * 1024) return setMessage("File size cannot exceed more than 2MB!")
        setFileURL(file)
    }

    async function submitForm() {
        var msg = ""
        if (!formParams?.name || !formParams?.description || !formParams?.price || !fileURL) {
            msg = "Please fill in the form!"
        }

        if (msg) {
            return setMessage(msg)
        }

        setLoading(true)

        var metadataURL = await uploadToIPFT()
        if (metadataURL) {
            try {
                //mint NFT
                var NFTId = await mintNFT(metadataURL)
                if (NFTId) {
                    setMessage("Paying gas for listing...")
                    await listNFT(NFTId)
                } else {
                    setMessage("Minting error")
                    setLoading(false)
                }
                setLoading(false)
            } catch (error) {
                console.log(error)
            }
        } else {
            setMessage("Upload failed")
            setLoading(false)
        }
    }

    async function uploadToIPFT() {
        setMessage("Uploading image to IPFS...")
        var result = null

        const f = new FormData()

        f.append("name", formParams.name)
        f.append("description", formParams.description)
        f.append("price", formParams.price)
        f.append("image", fileURL)

        const res = await fetch("/api/form", {
            method: "POST",
            body: f,
        })

        var msg = ""
        const resBody = await res.json()
        if (resBody.success) {
            result = resBody.url
            // msg = "IPFS: " + resBody.url;
            msg = "Uploaded image to IPFS! Paying gas for minting..."
        } else {
            msg = resBody?.message || "Something went wrong!"
        }
        setMessage(msg)
        return result
    }

    async function mintNFT(metadataURL) {
        var tokenId = null
        await contractNFT.methods
            .createToken(metadataURL)
            .send({ from: authState.account })
            .on("transactionHash", function (hash) {
                // console.log("transactionHash: "+transactionHash);
                setMessage("Minting... please wait.")
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
                if (result?.events?.Transfer?.returnValues?.tokenId) {
                    tokenId = result.events.Transfer.returnValues.tokenId
                }
            })

        return tokenId
    }

    async function listNFT(tokenId) {
        console.log("Going to pop wallet now to pay gas...")
        var sellingPrice = web3?.utils?.toWei(formParams.price, "ether")
        await contractNFTMarketplace.methods
            .listItem(contractNFT._address, tokenId, sellingPrice)
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
                Create new NFT to the marketplace
            </h3>
            <div className="mb-4">
                <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">
                    NFT Name
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="name"
                    type="text"
                    placeholder="Axie#4563"
                    onChange={(e) => updateFormParams({ ...formParams, name: e.target.value })}
                    value={formParams.name}
                ></input>
            </div>
            <div className="mb-6">
                <label
                    className="block text-purple-500 text-sm font-bold mb-2"
                    htmlFor="description"
                >
                    NFT Description
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    cols="40"
                    rows="3"
                    id="description"
                    type="text"
                    placeholder="Axie Infinity Collection"
                    value={formParams.description}
                    onChange={(e) =>
                        updateFormParams({ ...formParams, description: e.target.value })
                    }
                ></textarea>
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
                    Upload Image
                </label>
                <input
                    type="file"
                    // value={fileURL}
                    onChange={(e) => handleFileInput(e)}
                />
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
                    List NFT
                </button>
            )}
        </>
    )
}
