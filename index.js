const express = require('express');
const randomId = require('random-id');
const path = require('path');
const fs = require('fs')
const app = express();
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/mp4/')
    },
    filename: function (req, file, cb) {
        cb(null, randomId(4) + ".mp4")
    }
})

const upload = multer({ storage: storage })

app.use(express.json());



app.use((req, res, next) => {
    const allowedOrigin = 'https://video.guillaumeschaffer.fr';  // Remplacez par l'adresse que vous souhaitez autoriser

    if (true || req.headers.origin === allowedOrigin) {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Image-width, Image-height');


    }

    next();
});

app.get("/", (req, res) => {
    res.send("coucou");
});

// upload video from mobile to api
app.post("/upload", upload.single('binaryFile'), (req, res) => {
    console.log("upload");

    console.log(req.headers);
    // Gestion de l'erreur Multer
    if (!req.file && !req.files && !req.body) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const jsonData = {
        "code": req.file.filename.split(".")[0],
        "dim": { "width": req.get("Image-width"), "height": req.get("Image-height") }
    }

    fs.writeFile("data/dim/" + req.file.filename.split(".")[0] + ".json", JSON.stringify(jsonData), (err) => {
        if (err) {
            console.error(err);
            throw err;
        }
    })

    res.json({
        message: "Element received",
        data: req.file.filename.split(".")[0]
    });
});

// send video to web front end
app.post("/video", (req, res) => {
    console.log(req.body)
    const code = req.body.id;
    const videoPath = path.join(__dirname, 'data/mp4/' + code + '.mp4');
    console.log(code)
    if (fs.existsSync(videoPath)) {
        const options = {
            'headers': {
                'width': 120,
                'height': 150
            }
        };
        res.sendFile(videoPath, options, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("File sent successfully");
            }
        });
    } else {
        res.status(404).send("video file not found");
    }
});

// write data from web front end to api
app.post("/data", (req, res) => {

    const data = req.body;
    const jsonData = JSON.stringify(data);
    const filename = `data/dim/${data.code}.json`

    fs.writeFile(filename, jsonData, (err) => {
        if (err) {
            console.error(err);
            throw err;
        }
        console.log(filename + " written correctly");
    })

    res.json({
        message: "Data received"
    })
})

// get data for mobile
app.post("/loop", (req, res) => {
    console.log(req.body)
    const code = req.body.code;
    if (code == null) {
        return res.json({
            message: "missing code"
        })
    }
    const filename = `data/dim/${code}.json`

    console.log(filename)

    fs.readFile(filename, (error, data) => {
        if (error) {
            res.json({
                message: "no data"
            })
        } else {
            res.json({
                message: "data send",
                data: JSON.parse(data)
            })
        }
    })
})

app.post("/test/json/oneway/PBL_SwitchOnPosition", (req, res) => {
    res.json({
        message: "okay"
    })
})

const PORT = 5013;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});