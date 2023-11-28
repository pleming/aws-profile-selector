const fs = require("fs");
const { dialog } = require("electron");
const { ENCODING } = require("./const");

const ELECTRON_DIALOG_CONFIRM_NO = 1;

class MenuLoader {
    #browserWindow;

    constructor(browserWindow) {
        this.#browserWindow = browserWindow;
    }

    load() {
        return [
            {
                "label": "File",
                "submenu": [
                    {
                        "label": "Load",
                        "accelerator": "CmdOrCtrl+O",
                        "click": () => {
                            const apscFilePath = dialog.showOpenDialogSync({
                                "properties": ["openFile"],
                                "filters": [
                                    {
                                        "name": "AWS profile selector configuration file (*.apsc)",
                                        "extensions": ["apsc"]
                                    }
                                ]
                            });

                            if (!apscFilePath) {
                                return;
                            }

                            const response = dialog.showMessageBoxSync({
                                "type": "question",
                                "buttons": ["YES", "NO"],
                                "message": "It is overwritten with the configuration of the load file"
                            });

                            if (response === ELECTRON_DIALOG_CONFIRM_NO) {
                                return;
                            }

                            try {
                                const profileData = JSON.parse(fs.readFileSync(apscFilePath[0], ENCODING.UTF_8));
                                this.#browserWindow.webContents.send("profile:loadProfile", profileData);
                            } catch (error) {
                                dialog.showMessageBoxSync({
                                    "type": "error",
                                    "message": "AWS profile selector configuration loading failure"
                                });
                            } finally {
                                this.#browserWindow.webContents.send("loading:end", {
                                    "message": "Profile loading completed"
                                });
                            }
                        }
                    },
                    {
                        "label": "Save As",
                        "accelerator": "CmdOrCtrl+S",
                        "click": () => {
                            const apscFilePath = dialog.showSaveDialogSync({
                                "filters": [
                                    {
                                        "name": "AWS profile selector configuration file (*.apsc)",
                                        "extensions": ["apsc"]
                                    }
                                ]
                            });

                            if (!apscFilePath) {
                                return;
                            }

                            this.#browserWindow.webContents.send("profile:requestSaveConfiguration", { apscFilePath });
                        }
                    }
                ]
            },
            {
                "label": "Help",
                "submenu": [
                    {
                        "label": "About"
                    }
                ]
            }
        ];
    }
}

exports = module.exports = MenuLoader;
