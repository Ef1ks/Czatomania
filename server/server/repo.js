const {getDb} = require("./database");
const uuidv4 = require('uuid').v4;


const repo = {
    getMessage: async () => {
        try {
            const db = getDb()
            const history = await db.collection("messages")
                .find({
                    type: "GLOBAL_MESSAGE"
                })
                .sort({createdAt: -1})
                .limit(50)
                .toArray();
            return history.reverse()
        } catch (e) {
            console.error('Błąd MongoDB przy pobieraniu historii:', e);
        }
    },
    getPrivateMessage: async (currentUserUuid, recipientUuid) => {
        try {
            const db = getDb();
            const history = await db.collection("messages")
                .find({
                    type: "PRIVATE_MESSAGE",
                    $or: [
                        {senderUuid: currentUserUuid, recipientUuid: recipientUuid},
                        {senderUuid: recipientUuid, recipientUuid: currentUserUuid}
                    ]
                })
                .sort({createdAt: -1})
                .limit(50)
                .toArray();

            return history.reverse();
        } catch (e) {
            console.error('Błąd MongoDB przy pobieraniu historii PW:', e);
            return [];
        }
    },
    sendMessage: async (bytes, uuid, users) => {
        try {
            const payload = JSON.parse(bytes.toString());
            const currentUser = users[uuid];
            const db = getDb()
            const messageDocument = {
                senderUuid: uuid,
                username: currentUser.username,
                message: payload.message,
                createdAt: new Date(),
                type: payload.type,
            }

            if (payload.type === 'PRIVATE_MESSAGE') {
                messageDocument.recipientUuid = payload.recipientUuid;
            }

            const result = await db.collection('messages').insertOne(messageDocument);

            messageDocument._id = result.insertedId;

            return messageDocument;
        } catch (e) {
            console.error('Błąd procesowania wiadomości w WebSocket:', e);
        }
    },
    findUserByUsername: async (username) => {
        try {
            const db = getDb();
            return await db.collection("users").findOne({username: username});
        } catch (e) {
            console.error("Błąd podczas szukania użytkownika:", e);
            return null;
        }
    },

    createUser: async (username, password) => {
        try {
            const db = getDb();
            const newUser = {
                uuid: uuidv4(), // generujemy unikalny indentyfikator
                username,
                password, // jawne hasło (zgodnie z życzeniem - bez zabezpieczeń)
                createdAt: new Date()
            };
            await db.collection("users").insertOne(newUser);
            return newUser;
        } catch (e) {
            console.error("Błąd podczas tworzenia użytkownika:", e);
            return null;
        }
    }
}

module.exports = {repo};