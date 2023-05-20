import fs from "fs"
import { VECTOR_STORE_PATH } from "../consts/paths"

export default defineEventHandler(async (event) => {
    if (fs.existsSync(VECTOR_STORE_PATH)) {
        console.log("Vector already exists exists")
        return ({
            status: 200,
            message: "Vector already exists!",
            error: null
        })
    }

    return ({
        status: 501,
        message: "Error!",
        error: "No vector store found. Run 'npm run ingest' first"
    })
})
