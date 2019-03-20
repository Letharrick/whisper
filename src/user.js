const net = require('net');
const timers = require('timers');
const electronRemote = require('electron').remote
const hashids = require('hashids');
const packets = require('./packets');
const ui = require('./ui');

const HASHIDS = new hashids('Whisper', 0, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

class User {
    constructor(name) {
        this.name = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        this.id = HASHIDS.encode(Date.now()).substring(0, 4);
    }

    connect(serverAddress) {
        ui.toggleFields();
        ui.toggleLoading(false).then(v => {
            let [serverHost, serverPort] = serverAddress.split(':');
            serverPort = parseInt(serverPort);
            if (!serverPort) {
                serverPort = 25565;
            }
            
            this.socket = net.createConnection(serverPort, serverHost);
            this.socket.setTimeout(5000);


            this.socket.on('ready', () => {
                ui.toggleLoading(false).then(v => {
                    let handshake = new packets.Handshake(this);
                    this.socket.write(JSON.stringify(handshake));
                    ui.showChatroom();
                }, e => {});
            });
            this.socket.on('data', data => {
                let packet = JSON.parse(data);
                
                switch (packet.type) {
                    case 'UsernameList':
                        ui.resetUsernameList();
                        for (let usernameIndex in packet.usernames) {
                            ui.addUsername(packet.usernames[usernameIndex]);
                        }
                        break;

                    case 'Message':
                        ui.addMessage(packet);
                        break;

                    default:
                        alert('Error - Unknown Packet Type');
                        break;
                }
            });
            this.socket.on('end', () => {
                electronRemote.app.quit();
            });
            this.socket.on('timeout', () => {
                if ($('#login-form').is(':visible')) {
                    ui.toggleFields();
                    ui.toggleLoading(true).then(v => {
                    ui.shakeLoginForm();
                })
                }
            })
        }, e => {});
    }

    disconnect() {
        this.socket.end();
    }

    send(messageContent) {
        let message = new packets.Message(this, messageContent);

        this.socket.write(JSON.stringify(message));
    }
}

module.exports = {
    User: User
};