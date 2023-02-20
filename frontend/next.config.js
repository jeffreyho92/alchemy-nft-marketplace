module.exports = {
    trailingSlash: true,
    exportTrailingSlash: true,
    exportPathMap: function () {
        return {
            "/": { page: "/" },
        }
    },
}
