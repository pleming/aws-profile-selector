import profileModifyModal from "./modal/profile-modify-modal.js";
import otpModal from "./modal/otp-modal.js";
import profileService from "./service/profile-service.js";
import Constants from "./common/const.js";

const initialize = () => {
    const awsProfile = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE];

    for (const key in awsProfile) {
        profileService.appendProfile(key, awsProfile[key].hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
    }

    $("#btnNewProfile").attr("disabled", true);

    $(".btn-group-profile button").each((idx, elem) => {
        $(elem).attr("disabled", true);
    });
};

const registerEvent = () => {
    $("#switchOverwriteAgreement").click((event) => {
        $("#btnNewProfile").attr("disabled", !($(event.target).is(":checked")));

        $(".btn-group-profile button").each((idx, elem) => {
            $(elem).attr("disabled", !($(event.target).is(":checked")));
        })
    });

    $(".profile-button-container").on("click", ".btn-profile", (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        const profileName = profileButton.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE][profileName];

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            otpModal.show(profileName, profileData);
        } else {
            // TBD
        }
    });

    $("#btnNewProfile").click(() => {
        profileModifyModal.initialize();
        profileModifyModal.show();
    });

    $(".profile-button-container").on("click", ".btn-profile-modify", (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        const profileName = profileButton.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE][profileName];

        profileModifyModal.show(profileButton, profileName, profileData);
    });

    $(".profile-button-container").on("click", ".btn-profile-delete", async (event) => {
        const profileButtonGroup = $(event.target).closest(".btn-group-profile");
        const profileName = profileButtonGroup.children(".btn-profile").text();
        const response = await window.electronDialog.confirm(`Remove profile : ${profileName}`);

        if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
            return;
        }

        delete profileService[Constants.LOCAL_STORAGE.AWS_PROFILE][profileName];
        profileService.saveProfile(profileService[Constants.LOCAL_STORAGE.AWS_PROFILE]);

        profileButtonGroup.remove();
    });
};

$(() => {
    initialize();
    profileModifyModal.initialize();
    otpModal.initialize();

    registerEvent();
    profileModifyModal.registerEvent();
    otpModal.registerEvent();
});
