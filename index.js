const express = require('express');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5005;

app.use(cors())
app.use(express.json());

app.ws('/', (ws, req) => {
    ws.on('message', (msg => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case 'connection': {
                connectionHandler(ws, msg)
                break
            }
            case 'draw': {
                broadcastConnection(ws, msg)
            }

        }
    }))
})

app.post('/image', (req, res) => {
    try {
        const data = req.body.img.replace(`data:image/png;base64,`, '');
        const savePath = path.resolve(__dirname, 'files', `${req.query.id}.jpg`);
        fs.writeFileSync(savePath, data, 'base64');
        return res.status(200).json({message: 'downloaded'})
    } catch (e) {
        console.log(e)
        return res.status(500).json('error');
    }
})
app.get('/image', (req, res) => {
    try {
        const savePath = path.resolve(__dirname, 'files', `${req.query.id}.jpg`);
        const file = fs.readFileSync(savePath);
        const data = `data:image/png;base64,` + file.toString('base64');
        res.json(data);
        return res.status(200).json({message: 'file sent'})
    } catch (e) {
        console.log(e)
        return res.status(500).json('error');
    }
})

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`)
})

const connectionHandler = (ws, msg) => {
    ws.id = msg.id;
    broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
    aWss.clients.forEach(client => {
        if (client.id === msg.id) {
            client.send(JSON.stringify(msg))
        }
    })


}

