class Packet {
    constructor(packetType) {
        this.type = packetType
    }
}

class Handshake extends Packet {
    constructor(user) {
        super(Handshake.name);
        this.user = user;
    }
}

class UsernameList extends Packet {
    constructor(usernames) {
        super(UsernameList.name);
        this.usernames = usernames;
    }
}

class Message extends Packet {
    constructor(author, content) {
        super(Message.name);
        this.author = author;
        this.content = content;

        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let amOrPm = (hours < 12) ? 'AM' : 'PM';
        hours = (hours <= 12) ? hours : hours - 12;
        minutes = (minutes.toString().length == 1) ? '0' + minutes : minutes;

        this.timeSent = (hours + ':' + ((minutes.length == 3) ? ('0' + minutes) : minutes)) + '&nbsp;' + amOrPm;
    }
}

class Disconnect extends Packet {
    constructor(user) {
        super(Disconnect.name);
        this.user = user;
    }
}

module.exports = {
    Handshake,
    UsernameList,
    Message,
    Disconnect
}