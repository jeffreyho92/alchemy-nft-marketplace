module.exports = {
    trailingSlash: true,
    exportPathMap: function () {
        return {
            "/": { page: "/" },
            "/nftPage": { page: "/nftPage" },
            "/profile": { page: "/profile" },
            "/sellNFT": { page: "/sellNFT" },
        }
    },
}
