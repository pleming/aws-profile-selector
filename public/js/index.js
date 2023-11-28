import profileModifyModal from "./modal/profile-modify-modal.js";
import profileDeleteModal from "./modal/profile-delete-modal.js";
import otpModal from "./modal/otp-modal.js";
import profileService from "./service/profile-service.js";
import Constants from "./common/const.js";

const initialize = () => {
    $("#switchOverwriteAgreement").prop("checked", false);
    $(".profile-button-container").html("");

    const awsProfile = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE];

    for (const key in awsProfile) {
        profileService.appendProfile(key);
    }

    $("#btnNewProfile").attr("disabled", true);

    $(".btn-group-profile button").each((idx, elem) => {
        $(elem).attr("disabled", true);
    });

    const selectedProfileName = localStorage.getItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);

    if (selectedProfileName) {
        $(".btn-profile").each((idx, elem) => {
            const profileButton = $(elem);

            if (selectedProfileName === profileButton.text()) {
                profileService.selectProfile(profileButton);
                return false;
            }
        });
    }

    $(".loading-container").hide();
};

const registerEvent = () => {
    $("#switchOverwriteAgreement").click((event) => {
        $("#btnNewProfile").attr("disabled", !($(event.target).is(":checked")));

        $(".btn-group-profile button").each((idx, elem) => {
            $(elem).attr("disabled", !($(event.target).is(":checked")));
        })
    });

    $(".profile-button-container").on("click", ".btn-profile", async (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        const profileName = profileButton.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE][profileName];

        localStorage.setItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE, profileButton.text());

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            otpModal.show(profileButton, profileName, profileData);
        } else {
            const response = await window.electronDialog.confirm(`Setup profile : ${profileName}`);

            if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
                return;
            }

            const setupProfileResponse = await window.electronProfile.setupProfile({ profileName, profileData });

            if (!setupProfileResponse.status) {
                window.electronDialog.error(setupProfileResponse.message);
                profileService.releaseProfile();
                return;
            }

            window.electronDialog.info(setupProfileResponse.message);

            profileService.selectProfile(profileButton);
        }
    });

    $("#btnNewProfile").click(() => {
        profileModifyModal.initialize();
        profileModifyModal.show();
    });

    $(".profile-button-container").on("click", ".btn-profile-modify", (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        profileModifyModal.show(profileButton);
    });

    $(".profile-button-container").on("click", ".btn-profile-delete", async (event) => {
        const profileButtonGroup = $(event.target).closest(".btn-group-profile");
        profileDeleteModal.show(profileButtonGroup);
    });
};

const listenIPCMessage = () => {
    window.electronLoading.listenStartLoading((message) => {
        $("#loadingIndicatorTitle").text(message.title);
        $("#loadingIndicatorBody").text(message.body);
        $(".loading-container").show();
    });

    window.electronLoading.listenEndLoading((message) => {
        $("#loadingIndicatorTitle").text("");
        $("#loadingIndicatorBody").text("");
        $(".loading-container").hide();
    });

    window.electronProfile.listenLoadProfile((message) => {
        profileService[Constants.LOCAL_STORAGE.AWS_PROFILE] = {};
        profileService.saveProfile(Object.assign(profileService[Constants.LOCAL_STORAGE.AWS_PROFILE], message));
        localStorage.removeItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);
        initialize();
    });
};

$(() => {
    initialize();
    profileModifyModal.initialize();
    profileDeleteModal.initialize();
    otpModal.initialize();

    registerEvent();
    profileModifyModal.registerEvent();
    profileDeleteModal.registerEvent();
    otpModal.registerEvent();

    listenIPCMessage();
});
