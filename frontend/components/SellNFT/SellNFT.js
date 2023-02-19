import React, { useState, useEffect } from "react"
import Navbar from "../Navbar"
import { selectAuthState, setAuthState } from "../../store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import SellNFT_new from "./SellNFT_new"
import SellNFT_existing from "./SellNFT_existing"

const selectionClass =
    "inline-block w-full p-4 bg-white hover:text-gray-700 hover:bg-purple-50 dark:hover:text-white dark:bg-purple-800 dark:hover:bg-purple-700"
const selectionClassActive =
    "inline-block w-full p-4 text-white font-bold bg-purple-500 dark:bg-purple-700 dark:text-white active"

export default function SellNFT() {
    const authState = useSelector(selectAuthState)
    const [selected, setSelected] = useState("create-nft")

    return (
        <>
            <Navbar></Navbar>
            {authState.account && (
                <div className="flex flex-col place-items-center mt-10" id="nftForm">
                    <div className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4 w-2/5">
                        {/* <div className="sm:hidden">
                            <label for="tabs" className="sr-only">
                                Select
                            </label>
                            <select
                                id="tabs"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={onChangeSelect}
                                value={selected}
                            >
                                <option value="create-nft">Create NFT</option>
                                <option value="choose-nft">Choose NFT</option>
                            </select>
                        </div> */}
                        <ul className="hidden text-sm font-medium text-center text-gray-500 divide-x divide-gray-200 shadow sm:flex dark:divide-gray-700 dark:text-gray-400 rounded-lg">
                            <li className="w-full" onClick={() => setSelected("create-nft")}>
                                <a
                                    href="#"
                                    className={
                                        selected == "create-nft"
                                            ? selectionClassActive + " rounded-l-lg"
                                            : selectionClass + " rounded-l-lg"
                                    }
                                    aria-current="page"
                                >
                                    Create NFT
                                </a>
                            </li>
                            <li className="w-full" onClick={() => setSelected("choose-nft")}>
                                <a
                                    href="#"
                                    className={
                                        selected == "choose-nft"
                                            ? selectionClassActive + " rounded-r-lg"
                                            : selectionClass + " rounded-r-lg"
                                    }
                                >
                                    Choose NFT
                                </a>
                            </li>
                        </ul>

                        <br />
                        {selected == "create-nft" ? <SellNFT_new /> : <SellNFT_existing />}
                    </div>
                </div>
            )}
        </>
    )
}
