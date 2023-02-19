export const checkIPFSurl = (url) => {
    if (url && url.startsWith("ipfs://")) {
        url = url.replace("ipfs://", "https://ipfs.io/ipfs/")
    } else if (url && url.startsWith("https://gateway.pinata.cloud/ipfs/")) {
        url = url.replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/")
    }
    return url
}
