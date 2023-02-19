import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { selectAuthState, setAuthState } from "../store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { connectWeb3 } from "../utils/web3"

const navBorder = "p-2 cursor-pointer"
const navBorderActive = "border-b-2 p-2 cursor-pointer"

function Navbar() {
    const router = useRouter()
    const authState = useSelector(selectAuthState)
    const dispatch = useDispatch()

    useEffect(async () => {
        await connectWeb3()
        await checkIfWalletIsConnected()
    }, [])

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window

        if (!ethereum) {
            console.log("Make sure you have metamask!")
            return
        }

        ethereum
            .request({ method: "eth_accounts" })
            .then((accounts) => {
                const account = accounts[0]
                if (account) {
                    console.log("Connected", account)
                    dispatch(setAuthState({ ...authState, account }))
                }
            })
            .catch((err) => console.log(err))
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                alert("Get MetaMask!")
                return
            }

            ethereum
                .request({ method: "eth_requestAccounts" })
                .then((accounts) => {
                    window.location.reload()
                })
                .catch((err) => console.log(err))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="">
            <nav className="w-screen">
                <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
                    <li className="flex items-end ml-5 pb-2">
                        <Link href="/">
                            {/* <img src='/full_logo.png' alt="" width={120} height={120} className="inline-block -mt-2"/> */}
                            <div className="inline-block font-bold text-xl ml-2 cursor-pointer">
                                NFT Marketplace
                            </div>
                        </Link>
                    </li>
                    <li className="w-3/6">
                        <ul className="lg:flex justify-between font-bold mr-10 text-lg">
                            <Link href="/">
                                <li
                                    className={
                                        router.pathname === "/" ? navBorderActive : navBorder
                                    }
                                >
                                    Marketplace
                                </li>
                            </Link>
                            <Link href="/sellNFT">
                                <li
                                    className={
                                        router.pathname === "/sellNFT" ? navBorderActive : navBorder
                                    }
                                >
                                    List My NFT
                                </li>
                            </Link>
                            <Link href="/profile">
                                <li
                                    className={
                                        router.pathname === "/profile" ? navBorderActive : navBorder
                                    }
                                >
                                    Profile
                                </li>
                            </Link>
                            <li className="p-2 flex items-center">
                                {!authState.account ? (
                                    <button
                                        className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                        onClick={connectWallet}
                                    >
                                        Connect Wallet
                                    </button>
                                ) : (
                                    <div className="text-white text-bold text-right text-sm">
                                        {/* {authState.account ? "Connected to ":"Not Connected. Please login to view NFTs"}  */}
                                        {authState.account
                                            ? authState.account.substring(0, 6) +
                                              "...." +
                                              authState.account.substring(
                                                  authState.account.length - 4
                                              )
                                            : ""}
                                        <span className="network-text bg-blue-500">Goerli</span>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
            {!authState.account && (
                <div className="md:text-xl font-bold text-white text-center mt-20">
                    Please connect your wallet to continue!
                </div>
            )}
        </div>
    )
}

export default Navbar
