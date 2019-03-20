let fieldsEnabled = true;
let loadingCircleShowing = false;
let buttonsEnabled = true;

function toggleLoading(buttonsOn) {
    return new Promise((resolve, reject) => {
        if (buttonsOn) {
            enableButtons();
        } else {
            disableButtons();
        }
        toggleLoadingCircle().then(v => {
            resolve(v);
        }, e => {
            reject(e);
        })
    });
}

function toggleFields() {
    fieldsEnabled = !fieldsEnabled;

    $('#username-input').prop('disabled', !fieldsEnabled);
    $('#address-input').prop('disabled', !fieldsEnabled);

    if (fieldsEnabled) {
        usernameColor = (document.getElementById('username-input').checkValidity()) ? '#00FC37' : '#EC3F57';
        addressColor = (document.getElementById('address-input').checkValidity()) ? '#00FC37' : '#EC3F57';

        $('#username-input').css({'border-bottom': ('1px solid ' + usernameColor), 'box-shadow': ('0 1px 0 0 ' + usernameColor)});
        $('#address-input').css({'border-bottom': ('1px solid ' + addressColor), 'box-shadow': ('0 1px 0 0 ' + addressColor)});
        $('#username-input').attr('style', './index.css');
        $('#address-input').attr('style', './index.css');
    } else {
        $('#username-input').css({'border-bottom': '1px solid #A2B2CC', 'box-shadow': 'none'});
        $('#address-input').css({'border-bottom': '1px solid #A2B2CC', 'box-shadow': 'none'});
    }
}

function toggleLoadingCircle() {
    return new Promise((resolve, reject) => {
        let animDur = 500;

        let baseOffset = 1250;
        let loginFormOffset = '-=' + (baseOffset + 50);
        let buttonsOffset = loginFormOffset;
        let loadingCircleOffset = '-=' + (baseOffset - 750);

        let timeline = anime.timeline({
            delay: (el, i) => { return i * 50; },
            duration: animDur,
            easing: 'easeOutBack'
        });

        if (loadingCircleShowing) {
            timeline.add({
                targets: '#login-form',
                height: '-=55px',
            }).add({
                targets: '#host-button, #connect-button',
                translateY: '-=55px',
                offset: buttonsOffset
            }).add({
                targets: '#loading-circle',
                opacity: 0,
                offset: loadingCircleOffset,
                complete: animation => {
                    resolve('success');
                }
            });
        } else {
            timeline.add({
                targets: '#login-form',
                height: '+=55px',
            }).add({
                targets: '#connect-button, #host-button',
                translateY: '+=55px',
                offset: buttonsOffset
            }).add({
                targets: '#loading-circle',
                opacity: 1,
                offset: loadingCircleOffset,
                complete: animation => {
                    resolve('success');
                }
            });
        }

        loadingCircleShowing = !loadingCircleShowing;
    });
}

function shakeLoginForm() {
    anime({
        targets: '#login-form',
        translateX: [
            { value: 10 },
            { value: -10 },
            { value: 5 },
            { value: -5 },
            { value: 0 }
        ],
        duration: 500,
        easing: 'easeInOutSine',
    });
}

function showChatroom() {
    return new Promise((resolve, reject) => {
        let timeline = anime.timeline();

        timeline.add({
            targets: '#login-form',
            translateY: 400,
            opacity: 0,
            easing: 'easeInBack',
            duration: 500,
            complete: animation => {
                $('#login-form').remove();
                $('#chatroom').css({display: 'flex'});
            }
        }).add({
            targets: '#chatroom',
            opacity: 1,
            duration: 250,
            easing: 'easeInQuart',
            complete: animation => {
                resolve('success');
            }
        });
    });
}

function addMessage(message) {
    message.content = message.content.replace(/&lt;code/g, '<code').replace(/&lt;\/code&gt;/g, '</code>');
    
    $('#messages').append(`
        <div class="message">
            <div id="message-metadata">
                <div id="message-author">${message.author.name} (#${message.author.id})</div>
                <div id="message-time">${message.timeSent}</div>
            </div>
            <div id="message-content">${message.content}</div>
        </div>
    `);

    if (message.content.includes('</code>')) {
        $('code').each((i, element) => {
            element.innerText = element.innerText.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            highlightjs.highlightBlock(element);
        });
    }
}

function resetUsernameList() {
    $('#users').empty();
}

function addUsername(username) {
    $('#users').append(`
        <div class="user">
            ${username}
        </div>
    `);
}

function enableButtons() {
    $('#host-button').css({ 'pointer-events': 'all' });
    $('#connect-button').css({ 'pointer-events': 'all' });

    let timeline = anime.timeline();
    timeline.add({
        targets: '#host-button, #connect-button',
        background: '#EC3F57',
        duration: 150,
        offset: 0
    }).add({
        targets: '#host-button, #connect-button, #host-button i, #connect-button i',
        color: '#D1D1D1',
        duration: 150,
        offset: 0
    });

    buttonsEnabled = true;
}

function disableButtons() {
    $('#host-button').css({ 'pointer-events': 'none' });
    $('#connect-button').css({ 'pointer-events': 'none' });

    let timeline = anime.timeline();
    timeline.add({
        targets: '#host-button, #connect-button',
        background: '#722C37',
        duration: 150,
        offset: 0
    }).add({
        targets: '#host-button, #connect-button, #host-button i, #connect-button i',
        color: '#777',
        duration: 150,
        offset: 0
    });

    buttonsEnabled = false;
}

function toggleButtons() {
    if (buttonsEnabled) {
        disableButtons();
    } else {
        enableButtons();
    }
}

function getButtonsEnabled() {
    return buttonsEnabled;
}

module.exports = {
    getButtonsEnabled,
    showChatroom,
    toggleLoading,
    toggleLoadingCircle,
    toggleButtons,
    toggleFields,
    enableButtons,
    disableButtons,
    addUsername,
    resetUsernameList,
    addMessage,
    shakeLoginForm
}