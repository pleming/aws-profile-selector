import scheduleService from "./schedule-service.js";
import Constants from "../common/const.js";

const global = {
    "awsProfile": {},
    "mfaExpireTime": 0,
    "selectedProfileId": null
};

const profileButtonHTML =
    `<div class="btn-group btn-group-block btn-group-profile">
        <button type="button" class="btn btn-outline-primary btn-profile"></button>
        <button type="button" class="btn btn-outline-primary dropdown-toggle dropdown-toggle-split btn-split-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item btn-profile-modify" href="#">Modify</a></li>
            <li><a class="dropdown-item btn-profile-delete" href="#">Delete</a></li>
        </ul>
    </div>`;

const initialize = () => {
    global.awsProfile = JSON.parse(localStorage.getItem(Constants.LOCAL_STORAGE.AWS_PROFILE)) || {};
    global.mfaExpireTime = Number(localStorage.getItem(Constants.LOCAL_STORAGE.MFA_EXPIRE_TIME)) || 0;
    global.selectedProfileId = localStorage.getItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE) || null;

    $(".profile-button-container").html("");

    for (const profileId in global.awsProfile) {
        appendProfileButton(profileId);
    }

    selectProfileButton(global.selectedProfileId);
};

const appendProfileButton = (profileId) => {
    const profileButtonGroup = $($.parseHTML(profileButtonHTML));
    const profileButton = profileButtonGroup.find(".btn-profile");

    profileButton.text(global.awsProfile[profileId].profileName);
    profileButton.attr("data-profile-id", profileId);

    $(".profile-button-container").append(profileButtonGroup);
};

const selectProfileButton = (profileId) => {
    releaseProfileButton();

    const profileButton = $(`.btn-profile[data-profile-id=${profileId}]`);

    profileButton.parent(".btn-group-profile").find("button").each((idx, elem) => {
        $(elem).removeClass("btn-outline-primary");
        $(elem).addClass("btn-success");
    });
};

const updateProfileButton = (profileId) => {
    const profileData = global.awsProfile[profileId];
    const profileButton = $(`.btn-profile[data-profile-id=${profileId}]`);

    let txtProfileButton = profileData.profileName;

    if (isMFAProfile(profileId) && global.selectedProfileId === profileId) {
        txtProfileButton = `${txtProfileButton} (Remain : ${scheduleService.calcSessionTokenExpireRemainTime()})`;
    }

    profileButton.text(txtProfileButton);
};

const removeProfileButtonGroup = (profileId) => {
    $(`.btn-profile[data-profile-id=${profileId}]`).parent(".btn-group-profile").remove();
};

const releaseProfileButton = () => {
    $(".btn-group-profile").each((idx, groupElem) => {
        $(groupElem).find("button").each((idx, buttonElem) => {
            $(buttonElem).removeClass("btn-success");
            $(buttonElem).addClass("btn-outline-primary");
        });
    });

    const profileButton = $(`.btn-profile[data-profile-id=${global.selectedProfileId}]`);
    profileButton.text(profileButton.text().replace(/\s\(Remain\s\:\s[0-9]+\:[0-9]+\:[0-9]+\)/, ""));
};

const insertProfile = (profileData) => {
    verifyProfileData(profileData);
    checkDuplicatedProfileName(profileData.profileName);

    const newProfileId = self.crypto.randomUUID();
    global.awsProfile[newProfileId] = profileData;
    localStorage.setItem(Constants.LOCAL_STORAGE.AWS_PROFILE, JSON.stringify(global.awsProfile));

    return newProfileId;
};

const loadProfile = (profileId) => {
    return global.awsProfile[profileId];
};

const updateProfile = (profileId, originProfileData, newProfileData) => {
    verifyProfileData(newProfileData);

    if (originProfileData.profileName !== newProfileData.profileName) {
        checkDuplicatedProfileName(newProfileData.profileName);
    }

    global.awsProfile[profileId] = newProfileData;
    localStorage.setItem(Constants.LOCAL_STORAGE.AWS_PROFILE, JSON.stringify(global.awsProfile));
};

const deleteProfile = (profileId) => {
    delete global.awsProfile[profileId];
    localStorage.setItem(Constants.LOCAL_STORAGE.AWS_PROFILE, JSON.stringify(global.awsProfile));

    if (global.selectedProfileId === profileId && isMFAProfile(profileId)) {
        global.selectedProfileId = null;
        global.mfaExpireTime = 0;
        scheduleService.initialize();
    }
};

const selectProfile = async (profileId) => {
    const response = await window.electronDialog.confirm(`Setup profile : ${global.awsProfile[profileId].profileName}`);

    if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
        return;
    }

    const setupProfileResponse = await window.electronProfile.setupProfile({ "profile": global.awsProfile[profileId]});

    if (!setupProfileResponse.status) {
        window.electronDialog.error(setupProfileResponse.message);
        releaseProfile();
        return;
    }

    window.electronDialog.info(setupProfileResponse.message);
    selectProfileButton(profileId);

    global.selectedProfileId = profileId;
    localStorage.setItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE, profileId);

    scheduleService.initialize();
};

const selectMFAProfile = async (profileId, otp) => {
    const response = await window.electronProfile.setupMFAProfile(loadProfile(profileId), otp);

    if (!response.status) {
        window.electronDialog.error(response.message);

        const inputOTPElem = $("input[name=inputOTP]");
        inputOTPElem.val("");
        inputOTPElem.focus();

        releaseProfile();
        return false;
    }

    window.electronDialog.info(response.message);

    await selectProfileButton(profileId);

    global.selectedProfileId = profileId;
    localStorage.setItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE, global.selectedProfileId);

    global.mfaExpireTime = scheduleService.calcExpireTime();
    localStorage.setItem(Constants.LOCAL_STORAGE.MFA_EXPIRE_TIME, global.mfaExpireTime);

    scheduleService.schedule();
    return true;
};

const isMFAProfile = (profileId) => {
    if (!global.awsProfile[profileId]) {
        return false;
    }

    return global.awsProfile[profileId].hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN);
};

const isSelectedProfile = (profileId) => {
    const selectedProfileId = localStorage.getItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);
    return selectedProfileId === profileId;
};

const verifyProfileData = (profileData) => {
    for (const key in profileData) {
        if (!profileData[key]) {
            const errorMessage = `${key} is empty`;
            window.electronDialog.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
};

const releaseProfile = () => {
    releaseProfileButton();

    global.selectedProfileId = null;
    localStorage.removeItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);
};

const checkDuplicatedProfileName = (profileName) => {
    for (const profileId in global.awsProfile) {
        if (global.awsProfile[profileId].profileName === profileName) {
            const errorMessage = `Duplicated profile name : ${profileName}`;
            window.electronDialog.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
};

const convertAWSProfileToSaveConfiguration = () => {
    const config = {};

    for (const profileId in global.awsProfile) {
        const profileData = global.awsProfile[profileId];

        config[profileData.profileName] = {
            [Constants.AWS_PROPERTY.REGION]: profileData[Constants.AWS_PROPERTY.REGION],
            [Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]: profileData[Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID],
            [Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]: profileData[Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]
        };

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            config[profileData.profileName][Constants.AWS_PROPERTY.MFA_ARN] = profileData[Constants.AWS_PROPERTY.MFA_ARN];
        }
    }

    return config;
};

const loadConfiguration = (profile) => {
    global.awsProfile = {};
    localStorage.removeItem(Constants.LOCAL_STORAGE.AWS_PROFILE);

    for (const profileName in profile) {
        const profileData = profile[profileName];
        const newProfileData = {
            [Constants.ATTR.PROFILE_NAME]: profileName,
            [Constants.AWS_PROPERTY.REGION]: profileData[Constants.AWS_PROPERTY.REGION],
            [Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]: profileData[Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID],
            [Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]: profileData[Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]
        };

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            newProfileData[Constants.AWS_PROPERTY.MFA_ARN] = profileData[Constants.AWS_PROPERTY.MFA_ARN];
        }

        insertProfile(newProfileData);
    }

    localStorage.removeItem(Constants.LOCAL_STORAGE.MFA_EXPIRE_TIME);
    localStorage.removeItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);
};

export default {
    global,
    initialize,
    appendProfileButton,
    selectProfileButton,
    updateProfileButton,
    removeProfileButtonGroup,
    releaseProfileButton,
    insertProfile,
    loadProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    selectMFAProfile,
    isMFAProfile,
    isSelectedProfile,
    releaseProfile,
    checkDuplicatedProfileName,
    convertAWSProfileToSaveConfiguration,
    loadConfiguration
};
