const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const { ACTIVE_PROFILE } = require("./src/common/const");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 640,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (process.env.NODE_ENV === ACTIVE_PROFILE.DEV) {
        win.webContents.openDevTools();
    }

    win.loadFile("./view/index.html");

    return win;
}

app.whenReady().then(() => {
    const win = createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.handle("dialog:confirm", (event, message) => {
        return dialog.showMessageBoxSync({
            "type": "question",
            "buttons": ["Yes", "No"],
            "message": message
        });
    });

    ipcMain.on("dialog:alert", (event, message) => {
        dialog.showMessageBoxSync({
            "type": "info",
            "message": message
        });
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
