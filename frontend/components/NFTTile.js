import Link from "next/link"
import { checkIPFSurl } from "../utils/helper"

function NFTTile(data) {
    const newTo = {
        pathname: "/nftPage",
        query: { nftAddress: data.data.nftAddress, tokenId: data.data.tokenId },
    }
    return (
        <Link href={newTo}>
            <div className="border-2 ml-6 mr-6 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl cursor-pointer">
                <img
                    src={data.data.image ? checkIPFSurl(data.data.image) : ""}
                    alt=""
                    className="w-70 h-70 rounded-lg object-cover"
                />
                <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                    <strong className="text-xl">{data.data.name}</strong>
                    <p className="display-inline nft-box-desc">{data.data.description}</p>
                </div>
            </div>
        </Link>
    )
}

export default NFTTile
