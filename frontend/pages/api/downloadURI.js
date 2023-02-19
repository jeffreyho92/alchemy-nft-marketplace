import axios from "axios"

async function handleReq(req, res) {
    if (!req?.body?.tokenURI)
        return res.status(400).send({
            success: false,
            message: "Missing params",
        })

    var url = req.body.tokenURI
    return axios
        .get(url, { headers: { Accept: "text/plain" } })
        .then(function (response) {
            return res.status(200).send({
                success: true,
                response: response?.data || {},
            })
        })
        .catch(function (error) {
            // console.log(error)
            console.log("handleReq error")
            return res.status(400).send({
                success: false,
                message: error.message,
            })
        })
}

export default async function handler(req, res) {
    if (req.method == "POST") {
        await handleReq(req, res)
    } else {
        res.status(404).send({ message: "Method not found" })
    }
}
