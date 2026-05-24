const repo = require("./server/repo").repo;

// Dodajemy async i await
const returnMessage = async (bytes, uuid, users) => {
    return await repo.sendMessage(bytes, uuid, users);
};

module.exports = {returnMessage};