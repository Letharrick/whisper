const electron = require('electron');
const path = require('path');

let mainWindow;

function createWindow () {
    mainWindow = new electron.BrowserWindow({
        title: "Whisper",
        icon: path.join(__dirname, 'icon.png'),
        width: 800,
        height: 600,
        resizable: false,
        maximizable: false,
        center: true,
        frame: false,
        backgroundColor: "#FFFFFF",
        show: false
    });
    mainWindow.loadFile('index.html');

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    })
    mainWindow.on('closed', function () {
        mainWindow = null
    });
};
electron.app.on('ready', createWindow);


electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});
electron.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});