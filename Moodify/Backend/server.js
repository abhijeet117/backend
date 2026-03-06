require("dotenv").config()

const app = require("./src/app")
const connectToDatabase = require("./src/config/database")
const { warmPreviewSongCache } = require("./src/services/previewSong.service")

const PORT = process.env.PORT || 5000

connectToDatabase()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
})

setTimeout(() => {
    warmPreviewSongCache()
}, 0)
