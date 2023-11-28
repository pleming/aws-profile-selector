import profileService from "./profile-service.js";

let mfaTimerId;

const initialize = () => {
    clearInterval(mfaTimerId);
    mfaTimerId = null;
};

const schedule = () => {
    initialize();

    const selectedProfileId = profileService.global.selectedProfileId;

    if (!profileService.isMFAProfile(selectedProfileId)) {
        return;
    }

    const profileButton = $(`.btn-profile[data-profile-id=${selectedProfileId}]`);
    const profileData = profileService.loadProfile(selectedProfileId);

    const scheduleFunction = () => {
        const remainTime = calcSessionTokenExpireRemainTime();

        if (remainTime === "00:00:00") {
            profileService.releaseProfile();
            return;
        }

        profileButton.text(`${profileData.profileName} (Remain : ${remainTime})`);
    };

    scheduleFunction();

    mfaTimerId = setInterval(scheduleFunction, 1000);
};

const calcExpireTime = () => {
    return new Date().getTime() + 43200000;
};

const calcSessionTokenExpireRemainTime = () => {
    const currentTime = new Date().getTime();

    let timeDiff = profileService.global.mfaExpireTime - currentTime;
    timeDiff = timeDiff <= 0 ? 0 : timeDiff;

    if (timeDiff === 0) {
        clearInterval(mfaTimerId);
        return "00:00:00";
    }

    const hour = Math.floor((timeDiff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
    const minute = Math.floor((timeDiff / (1000 * 60)) % 60).toString().padStart(2, "0");
    const second = Math.floor((timeDiff / 1000) % 60).toString().padStart(2, "0");

    return `${hour}:${minute}:${second}`;
};

export default {
    initialize,
    schedule,
    calcExpireTime,
    calcSessionTokenExpireRemainTime
};
