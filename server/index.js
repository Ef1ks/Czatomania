require('dotenv').config();
const http = require('http');
const {WebSocketServer} = require("ws");
const url = require('url');
const uuidv4 = require('uuid').v4;
const {parse} = require('cookie');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {repo} = require("./server/repo");
const {returnMessage} = require("./handlers");
const {connectToServer} = require('./server/database');


const port = process.env.PORT || 8000;
const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());


const connections = {}
const users = {}

app.post('/api/login', async (req, res) => {
    console.log(req.body);
    const {username, password} = req.body; // <--- Odbieramy też password

    if (!username || !password) {
        return res.status(400).json({error: 'Brak parametru username lub password w body'});
    }

    try {
        let dbUser = await repo.findUserByUsername(username);
        if (dbUser) {
            if (dbUser.password !== password) {
                return res.status(401).json({error: 'Niepoprawne hasło dla podanego użytkownika'});
            }
        } else {
            dbUser = await repo.createUser(username, password);
            if (!dbUser) {
                return res.status(500).json({error: 'Nie udało się zarejestrować użytkownika'});
            }
        }

        const userUuid = dbUser.uuid;

        const cookieOptions = {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            secure: false
        };

        res.cookie('username', dbUser.username, cookieOptions);
        res.cookie('userUuid', userUuid, cookieOptions);

        return res.json({
            success: true,
            user: {uuid: userUuid, username: dbUser.username}
        });

    } catch (error) {
        console.error("Błąd procesu logowania:", error);
        return res.status(500).json({error: "Błąd serwera"});
    }
});

app.post('/api/logout', (req, res) => {
    const {userUuid} = req.cookies;
    if (userUuid && connections[userUuid]) {
        console.log(`Wylogowanie: Zamykanie aktywnego gniazda WS dla UUID: ${userUuid}`);
        connections[userUuid].close();
    }
    const clearCookieOptions = {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        expires: new Date(0)
    };
    res.cookie('username', '', clearCookieOptions);
    res.cookie('userUuid', '', clearCookieOptions);

    return res.json({
        success: true,
        message: 'Pomyślnie wylogowano i wyczyszczono sesję'
    });
});

app.get('/api/me', (req, res) => {
    const {username, userUuid} = req.cookies;

    if (!username || !userUuid) {
        return res.status(401).json({error: 'Niezalogowany'});
    }
    return res.json({
        user: {uuid: userUuid, username}
    });
});

app.get('/api/messages', async (req, res) => {
    const {username, userUuid} = req.cookies;
    if (!username || !userUuid) {
        return res.status(401).json({error: 'Niezalogowany'});
    }
    const messages = await repo.getMessage()
    return res.json(messages)
})

app.get('/api/messages/private', async (req, res) => {
    const {username, userUuid} = req.cookies;
    if (!username || !userUuid) {
        return res.status(401).json({error: 'Niezalogowany'});
    }
    const {recipientUuid} = req.query;
    if (!recipientUuid) {
        return res.status(400).json({error: 'Brak parametru recipientUuid w query'});
    }
    const privateHistory = await repo.getPrivateMessage(userUuid, recipientUuid);
    return res.json(privateHistory);
});


const server = http.createServer(app)


const wsServer = new WebSocketServer({server})

const broadcast = (outgoingEvent) => {
    Object.values(connections).forEach(connection => {
        if (connection.readyState === 1) { // WebSocket.OPEN
            connection.send(outgoingEvent);
        }
    });
}

const handleMessage = async (bytes, uuid) => {
    try {
        const messageData = await returnMessage(bytes, uuid, users);
        const outgoingEvent = JSON.stringify({
            type: 'NEW_MESSAGE',
            data: messageData
        });

        broadcast(outgoingEvent);
    } catch (error) {
        console.error("Błąd podczas handleMessage:", error);
    }
};

const handleClose = (uuid) => {
    delete connections[uuid]
    delete users[uuid]
    broadcast(JSON.stringify({
        type: 'USER_LEFT',
        data: users
    }));
}

wsServer.on('connection', (connection, request) => {
    console.log('=== NOWE POŁĄCZENIE WEBSOCKET ===');
    console.log('Wszystkie nagłówki żądania:', request.headers); // ZOBACZ TO W KONSOLI
    console.log('Surowy nagłówek cookie:', request.headers.cookie);

    const cookies = parse(request.headers.cookie || "");
    console.log('Sparsowane ciasteczka:', cookies);
    let username = cookies.username;
    let uuid = cookies.userUuid;

    if (!username || !uuid) {
        console.log("Odrzucono połączenie WS: brak ciasteczek sesyjnych");
        connection.close();
        return;
    }

    console.log(`Połączono WS: ${username} z zadeklarowanym UUID: ${uuid}`);

    connections[uuid] = connection

    users[uuid] = {
        username: username,
        state: {
            typing: false,
        }
    }

    broadcast(JSON.stringify({
        type: 'USER_JOINED',
        data: users
    }));

    connection.on('message', (message) => {
        console.log("kliknieto mnie")
        return handleMessage(message, uuid);
    })

    connection.on('close', () => {
        return handleClose(uuid);
    })

})

connectToServer()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Nie udało się uruchomić serwera z powodu błędu bazy danych:", error);
        process.exit(1);
    });






