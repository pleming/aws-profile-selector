import tosService from "./service/tos-service.js";
import profileService from "./service/profile-service.js";
import scheduleService from "./service/schedule-service.js";
import loadingService from "./service/loading-service.js";
import profileModifyModal from "./modal/profile-modify-modal.js";
import profileDeleteModal from "./modal/profile-delete-modal.js";
import otpModal from "./modal/otp-modal.js";

import Constants from "./common/const.js";

const initialize = () => {
    profileService.initialize();
    tosService.initialize();
    scheduleService.schedule();
    loadingService.initialize();
};

const registerEvent = () => {
    $(".profile-button-container").on("click", ".btn-profile", async (event) => {
        const profileId = $(event.target).attr("data-profile-id");
        const profileData = profileService.loadProfile(profileId);

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            otpModal.show(profileId);
        } else {
            await profileService.selectProfile(profileId);
        }
    });

    $("#btnNewProfile").click(() => {
        profileModifyModal.show();
    });

    $(".profile-button-container").on("click", ".btn-profile-modify", (event) => {
        const profileId = $(event.target).closest(".btn-group-profile").children(".btn-profile").attr("data-profile-id");
        profileModifyModal.show(profileId);
    });

    $(".profile-button-container").on("click", ".btn-profile-delete", async (event) => {
        const profileId = $(event.target).closest(".btn-group-profile").children(".btn-profile").attr("data-profile-id");
        profileDeleteModal.show(profileId);
    });
};

const listenIPCMessage = () => {
    window.electronLoading.listenStartLoading((message) => {
        loadingService.startLoading(message.title, message.body);
    });

    window.electronLoading.listenEndLoading((message) => {
        loadingService.endLoading();
    });

    window.electronProfile.listenLoadProfile((message) => {
        profileService.loadConfiguration(message);
        initialize();
    });

    window.electronProfile.listenRequestSaveConfiguration(async (message) => {
        const response = await window.electronProfile.saveConfiguration(message.apscFilePath, profileService.convertAWSProfileToSaveConfiguration());

        if (!response.status) {
            window.electronDialog.error(response.message);
            return;
        }

        window.electronDialog.info(response.message);
    });

    window.electronMenu.listenOpenAbout(async (message) => {
        $("#aboutModal").modal("show");
    });
};

$(() => {
    initialize();
    profileModifyModal.initialize();
    profileDeleteModal.initialize();
    otpModal.initialize();

    registerEvent();
    tosService.registerEvent();
    profileModifyModal.registerEvent();
    profileDeleteModal.registerEvent();
    otpModal.registerEvent();

    listenIPCMessage();
});
