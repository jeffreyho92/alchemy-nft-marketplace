import formidable from "formidable"
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata"
import * as fs from "fs"

async function validateFromData(fields, files) {
    try {
        if (!fields?.name || !fields?.description || !fields?.price || !isFileValid(files.image)) {
            return false
        } else if (parseFloat(fields?.price) <= 0) {
            return false
        }
        return true
    } catch (e) {
        return false
    }
}

function isFileValid(file) {
    const type = file?.mimetype?.split("/").pop() || ""
    const validTypes = ["jpg", "jpeg", "png"]
    if (validTypes.indexOf(type) === -1) {
        return false
    }
    return true
}

async function handlePostFormReq(req, res) {
    const form = formidable()

    const formData = new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                reject("error")
            }
            resolve({ fields, files })
        })
    })

    try {
        const { fields, files } = await formData
        const isValid = await validateFromData(fields, files)
        if (!isValid) return res.status(400).send({ message: "Invalid form schema" })
        var msg = "Something went wrong"

        var image = fs.createReadStream(files.image.filepath)
        var imageIPFS = await uploadFileToIPFS(image)
        console.log("imageIPFS", imageIPFS)
        if (imageIPFS?.success) {
            const { name, description } = fields
            const nftJSON = {
                name,
                description,
                image: imageIPFS.pinataURL,
            }
            console.log("nftJSON", nftJSON)
            var jsonIPFS = await uploadJSONToIPFS(nftJSON)
            console.log("jsonIPFS", jsonIPFS)
            if (jsonIPFS?.success) {
                return res.status(200).send({
                    success: true,
                    message: "Submitted successfully",
                    url: jsonIPFS.pinataURL,
                })
            } else {
                msg = jsonIPFS?.message ? jsonIPFS.message : "Upload JSON failed"
            }
        } else {
            msg = imageIPFS?.message ? imageIPFS.message : "Upload image failed"
        }

        return res.status(500).send({ message: msg })
    } catch (e) {
        console.log("e", e)
        return res.status(400).send({ message: "Invalid submission" })
    }
}

export default async function handler(req, res) {
    if (req.method == "POST") {
        await handlePostFormReq(req, res)
    } else {
        res.status(404).send({ message: "Method not found" })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}
