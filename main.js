const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");

const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();
const { exec } = require("child_process");

const MenuLoader = require("./src/common/menu-loader");
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
};

const writeProfile = (profile) => {
    const defaultProfile = `[default]\nregion = ${profile.region}`;
    fs.writeFileSync(`${homedir}/.aws/config`, defaultProfile);

    const defaultCredentials = `[default]\naws_access_key_id = ${profile["aws_access_key_id"]}\naws_secret_access_key = ${profile["aws_secret_access_key"]}`;
    fs.writeFileSync(`${homedir}/.aws/credentials`, defaultCredentials);
};

const writeSessionToken = (session) => {
    const credentials = JSON.parse(session).Credentials;
    const newCredentials = `[default]\naws_access_key_id = ${credentials.AccessKeyId}\naws_secret_access_key = ${credentials.SecretAccessKey}\naws_session_token = ${credentials.SessionToken}`;
    fs.writeFileSync(`${homedir}/.aws/credentials`, newCredentials);
};

const setupMFAProfile = async (profile, otp) => {
    writeProfile(profile);

    const response = await new Promise((resolve, reject) => {
        exec(`aws sts get-session-token --serial-number ${profile["mfa_arn"]} --token-code ${otp} --profile default`, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
                return;
            }

            resolve(stdout);
        });
    });

    writeSessionToken(response);
};

app.whenReady().then(() => {
    const win = createWindow();

    Menu.setApplicationMenu(Menu.buildFromTemplate(new MenuLoader(win).load()));

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.handle("profile:setupProfile", async (event, message) => {
        const { profile } = message;

        win.webContents.send("loading:start", {
            "title": `Apply AWS profile : ${profile.profileName}`,
            "body": "Loading..."
        });

        try {
            writeProfile(profile.profileData);

            return {
                "status": true,
                "message": "AWS profile setup completed"
            };
        } catch (error) {
            return {
                "status": false,
                "message": error.message
            };
        } finally {
            win.webContents.send("loading:end", {
                "message": "AWS profile setup completed"
            });
        }
    });

    ipcMain.handle("profile:setupMFAProfile", async (event, message) => {
        const { profile, otp } = message;

        win.webContents.send("loading:start", {
            "title": `Apply AWS profile : ${profile.profileName}`,
            "body": "Loading..."
        });

        try {
            await setupMFAProfile(profile.profileData, otp);

            return {
                "status": true,
                "message": "AWS profile setup completed"
            };
        } catch (error) {
            return {
                "status": false,
                "message": error.message
            };
        } finally {
            win.webContents.send("loading:end", {
                "message": "AWS profile setup completed"
            });
        }
    });

    ipcMain.handle("dialog:confirm", (event, message) => {
        return dialog.showMessageBoxSync({
            "type": "question",
            "buttons": ["Yes", "No"],
            "message": message
        });
    });

    ipcMain.on("dialog:alert:info", (event, message) => {
        dialog.showMessageBoxSync({
            "type": "info",
            "message": message
        });
    });

    ipcMain.on("dialog:alert:warning", (event, message) => {
        dialog.showMessageBoxSync({
            "type": "warn",
            "message": message
        });
    });

    ipcMain.on("dialog:alert:error", (event, message) => {
        dialog.showMessageBoxSync({
            "type": "error",
            "message": message
        });
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
