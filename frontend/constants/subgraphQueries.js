import { gql } from "@apollo/client"

const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(first: 5, where: { buyer: "0x0000000000000000000000000000000000000000" }) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`

const GET_LISTED_ITEM_BY_SELLER = gql`
    query runQuery($account: Bytes!) {
        activeItems(where: { seller: $account }) {
            # activeItems(seller: "0x48cd269c9d5d388895e15aafa4ce6b88384b124d") {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`

const GET_LISTED_ITEM_BY_BUYER = gql`
    query runQuery($account: Bytes!) {
        activeItems(where: { buyer: $account }) {
            # activeItems(buyer: "0x48cd269c9d5d388895e15aafa4ce6b88384b124d") {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`

const GET_LISTED_ITEM_BY_NFT_ID = gql`
    query runQuery($nftAddress: Bytes!, $tokenId: String!) {
        # {
        activeItems(where: { nftAddress: $nftAddress, tokenId: $tokenId }) {
            # activeItems(
            # where: { nftAddress: "0xc6e9bb643faa16ed68689ffffcda49bc28e0a484", tokenId: "2" }
            # ) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`

export {
    GET_ACTIVE_ITEMS,
    GET_LISTED_ITEM_BY_SELLER,
    GET_LISTED_ITEM_BY_BUYER,
    GET_LISTED_ITEM_BY_NFT_ID,
}
