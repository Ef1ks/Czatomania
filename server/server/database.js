require('dotenv').config();
const {MongoClient} = require("mongodb");

const mongoUrl = process.env.MONGO_URL;

const client = new MongoClient(mongoUrl,);

let dbConnection;

const connectToServer = async () => {
    try {
        await client.connect();
        dbConnection = client.db("lab");
        await dbConnection.collection('messages').createIndex({createdAt: -1});

        console.log("Pomyślnie połączono z MongoDB!");
    } catch (error) {
        console.error("Krytyczny błąd połączenia z bazą:", error);
        process.exit(1);
    }
};

const getDb = () => {
    if (!dbConnection) {
        throw new Error(
            "Brak połączenia z bazą danych. Wywołaj najpierw connectToServer().",
        );
    }
    return dbConnection;
};

module.exports = {
    connectToServer,
    getDb
};