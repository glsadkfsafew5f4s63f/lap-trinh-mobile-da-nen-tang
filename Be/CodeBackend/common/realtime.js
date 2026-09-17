const clients = new Set();

function addClient(socket) {
    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
}

function broadcast(event) {
    const payload = JSON.stringify(event);
    for (const socket of clients) {
        if (socket.readyState === 1) {
            socket.send(payload);
        }
    }
}

module.exports = { addClient, broadcast };
