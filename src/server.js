const net = require('net');
const packets = require('./packets');

class Server {
    constructor(port) {
        this.port = parseInt(port);
        if (!this.port) {
            this.port = 25565;
        }

        this.users = {};
        this.socket = net.createServer(socket => {
            socket.on('data', data => {
                let packet = JSON.parse(data);

                switch (packet.type) {
                    case 'Handshake':
                        this.users[packet.user.id]  = packet.user;
                        packet.user.socket = socket; // Add the 'write' function to the socket attribute
                        this.refreshUsernameList();
                        
                        packet.user.socket.on('end', () => {
                            delete this.users[packet.user.id];
                            this.refreshUsernameList();
                        });
                        break;
                    
                    case 'Message':
                        this.broadcast(packet);
                        break;
                }
            });
        });
    }

    start() {
        this.socket.listen(this.port, '0.0.0.0');
    }

    close() {
        this.socket.close();
    }
    
    broadcast(packet) {
        for (let userId in this.users) {
            let user = this.users[userId];
            user.socket.write(JSON.stringify(packet));
        }
    }

    refreshUsernameList() {
        let usernames = Object.values(this.users).map(user => { return user.name });
        let usernameList = new packets.UsernameList(usernames);

        this.broadcast(usernameList);
    }
}

module.exports = {
    Server
};