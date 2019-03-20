const electronRemote = require("electron").remote;
const showdown = require('showdown');
const highlightjs = require('highlight.js');
const ui = require('./ui');
const {Server} = require('./server');
const {User} = require('./user');

const MAX_USERNAME_LENGTH = 15;
const MAX_PORT = 65535;
const ADDRESS_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
const MARKDOWN_CONVERTER = new showdown.Converter();

function processMessageContent(messageContent) {
    messageContent = messageContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return MARKDOWN_CONVERTER.makeHtml(messageContent);
}

let server;
let user;

function init() {
    // Have the host and connect buttons be disabled initially
    ui.disableButtons();

    $('#loading-circle').css({opacity: 0});
    
    // Show login form
    anime({
        targets: '#login-form',
        scale: [0.5, 1],
        opacity: 1,
        duration: 1250
    });

    // Set up markdown syntax highlighting
    highlightjs.initHighlighting();
    MARKDOWN_CONVERTER.setOption('emoji', true);
    MARKDOWN_CONVERTER.setOption('strikethrough', true);

    // Set up the frame buttons
    $('#close-button').click(() => {
        if (user) {
            user.disconnect().then(_ => {
                electronRemote.app.quit();
            });
        }

        electronRemote.app.quit();
    });
    $('#minimize-button').click(() => {
        let win = electronRemote.getCurrentWindow();
        win.minimize();
    });

    // Listen to keypresses on the login form inputs
    $('.login-input').keyup(key => {
        let username = $('#username-input').val();
        let address = $('#address-input').val();
        let [host, port] = address.split(':');
        let okayUsername = (username && username.length <= MAX_USERNAME_LENGTH);
        let okayAddress = address.match(ADDRESS_REGEX);

        if (okayUsername && okayAddress) {
            if (!ui.getButtonsEnabled()) {
                ui.enableButtons();
            }
        } else {
            if (ui.getButtonsEnabled()) {
                ui.disableButtons();
            }
        }
    })
    $('#username-input').keyup(key => {
        let username = $('#username-input').val();
        
        if (username && username.length <= MAX_USERNAME_LENGTH) {
            $('#username-input').removeClass('invalid');
            $('#username-input').addClass('valid');
        } else {
            $('#username-input').removeClass('valid');
            $('#username-input').addClass('invalid');
        }
    })
    $('#address-input').keyup(key => {
        let address = $('#address-input').val();

        if (address.match(ADDRESS_REGEX)) {
            let [ip, port] = address.split(':');
            port = parseInt(port);

            if (port >= 0 && port <= MAX_PORT) {
                $('#address-input').removeClass('invalid');
                $('#address-input').addClass('valid');
            } else {
                $('#address-input').removeClass('valid');
                $('#address-input').addClass('invalid');
            }
        } else {
            $('#address-input').removeClass('valid');
            $('#address-input').addClass('invalid');
        }
    })
    
    $('#host-button').click(() => {
        let username = $('#username-input').val();
        let address = $('#address-input').val();
        let [host, port] = address.split(':');

        server = new Server(port);
        server.start();

        user = new User(username);
        if (user.connect(address)) {
            ui.showChatroom();
        }
    });
    $('#connect-button').click(() => {
        let username = $('#username-input').val();
        let address = $('#address-input').val();
        
        user = new User(username);
        user.connect(address);
    });

    $('#message-box').keypress(event => {
        let element = $('#message-box').get(0);
        let heightValue = parseInt(element.style.height.split('px')[0]);
        let selectedText = element.value.substring(element.selectionStart, element.selectionEnd);

        if (selectedText) {
            let newlineCount = selectedText.split('\n').length - 1;
            element.style.height = (heightValue - (14 * newlineCount)) + 'px';
        }
    })
    $('#message-box').keydown(event => {
        let element = $('#message-box').get(0);

        if (event.keyCode == 13) {
            event.preventDefault();
            let messageContent = $('#message-box').val();

            if (event.shiftKey) {
                let value = $('#message-box').val();
                let cursorPos = $('#message-box').prop('selectionStart');
                let textBeforeCursor = value.substring(0, cursorPos);
                let textAfterCursor = value.substring(cursorPos, value.length);
                let newValue = textBeforeCursor + '\n' + textAfterCursor;
                let newCursorPos = cursorPos + 1;

                $('#message-box').val(newValue);
                $('#message-box').prop('selectionEnd', newCursorPos);
            } else if (messageContent) {
                messageContent = processMessageContent(messageContent);
                user.send(messageContent);
                $('#message-box').val('');
                $('#message-box').height(14);
            }
        }

        // Adjust the size of the message box
        let selectedText = element.value.substring(element.selectionStart, element.selectionEnd);
        let heightValue = parseInt(element.style.height.split('px')[0]);
        let isNewlineBackspace = element.value.substring(element.selectionStart - 1, element.selectionStart) == '\n';
        
        if (event.keyCode == 8) {
            if (selectedText) {
                let newlineCount = selectedText.split('\n').length - 1;
                element.style.height = (heightValue - (14 * newlineCount)) + 'px';
            } else {
                if (isNewlineBackspace) {
                    element.style.height = (heightValue - 14) + 'px';
                }
            }
        } else {
            element.style.height = element.scrollHeight + 'px';
        }
    });
}

// When the HTML is ready
$(document).ready(() => {
    init();
});