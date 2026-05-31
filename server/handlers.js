const repo = require("./server/repo").repo;

const returnMessage = async (bytes, uuid, users) => {
    return await repo.sendMessage(bytes, uuid, users);
};

module.exports = {returnMessage};