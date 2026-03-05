const app = require("./src/app")

const connectToDatabase = require("./src/config/database")
const { warmPreviewSongCache } = require("./src/services/previewSong.service")
connectToDatabase()

app.listen(3000, ()=>{
    console.log("Server is running...")
})

setTimeout(() => {
    warmPreviewSongCache()
}, 0)
