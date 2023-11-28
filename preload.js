const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProfile", {
    "setupProfile": async (profile) => {
        return await ipcRenderer.invoke("profile:setupProfile", { profile });
    },
    "setupMFAProfile": async (profile, otp) => {
        return await ipcRenderer.invoke("profile:setupMFAProfile", { profile, otp });
    },
    "saveConfiguration": async (apscFilePath, configuration) => {
        return await ipcRenderer.invoke("profile:saveConfiguration", { apscFilePath, configuration });
    },
    "listenLoadProfile": async (callback) => {
        ipcRenderer.on("profile:loadProfile", (event, message) => {
            callback(message);
        });
    },
    "listenRequestSaveConfiguration": async (callback) => {
        ipcRenderer.on("profile:requestSaveConfiguration", async (event, message) => {
            callback(message);
        });
    }
});

contextBridge.exposeInMainWorld("electronDialog", {
    "confirm": async (message) => {
        return await ipcRenderer.invoke("dialog:confirm", message);
    },
    "info": (message) => {
        ipcRenderer.send("dialog:alert:info", message);
    },
    "warning": (message) => {
        ipcRenderer.send("dialog:alert:warning", message);
    },
    "error": (message) => {
        ipcRenderer.send("dialog:alert:error", message);
    }
});

contextBridge.exposeInMainWorld("electronLoading", {
    "listenStartLoading": async (callback) => {
        ipcRenderer.on("loading:start", (event, message) => {
            callback(message);
        });
    },
    "listenEndLoading": async (callback) => {
        ipcRenderer.on("loading:end", (event, message) => {
            callback(message);
        });
    }
});
