const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronDialog", {
    "confirm": async (message) => {
        return await ipcRenderer.invoke("dialog:confirm", message);
    },
    "alert": (message) => {
        ipcRenderer.send("dialog:alert", message);
    }
});
