const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProfile", {
    "setupProfile": async (profile) => {
        const message = {
            "profile": profile.profileData
        };

        return await ipcRenderer.invoke("profile:setupProfile", message);
    },
    "setupMFAProfile": async (profile, otp) => {
        const message = {
            "profile": profile.profileData,
            otp
        };

        return await ipcRenderer.invoke("profile:setupMFAProfile", message);
    }
});

contextBridge.exposeInMainWorld("electronDialog", {
    "confirm": async (message) => {
        return await ipcRenderer.invoke("dialog:confirm", message);
    },
    "alert": (message) => {
        ipcRenderer.send("dialog:alert", message);
    }
});
