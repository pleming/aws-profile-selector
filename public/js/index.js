import configModifyModal from "./modal/config-modify-modal.js";
import otpModal from "./modal/otp-modal.js";
import profileService from "./service/profile-service.js";
import Constants from "./common/const.js";

const initialize = () => {
    const awsConfig = profileService[Constants.LOCAL_STORAGE.AWS_CONFIG];

    for (const key in awsConfig) {
        profileService.appendProfile(key, awsConfig[key].hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
    }

    $("#btnNewConfig").attr("disabled", true);

    $(".btn-group-profile button").each((idx, elem) => {
        $(elem).attr("disabled", true);
    });
};

const registerEvent = () => {
    $("#switchOverwriteAgreement").click((event) => {
        $("#btnNewConfig").attr("disabled", !($(event.target).is(":checked")));

        $(".btn-group-profile button").each((idx, elem) => {
            $(elem).attr("disabled", !($(event.target).is(":checked")));
        })
    });

    $(".profile-button-container").on("click", ".btn-profile", (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        const profileName = profileButton.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_CONFIG][profileName];

        if (profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN)) {
            otpModal.show(profileName, profileData);
        } else {
            // TBD
        }
    });

    $("#btnNewConfig").click(() => {
        configModifyModal.initialize();
        configModifyModal.show();
    });

    $(".profile-button-container").on("click", ".btn-config-modify", (event) => {
        const profileButton = $(event.target).closest(".btn-group-profile").children(".btn-profile");
        const profileName = profileButton.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_CONFIG][profileName];

        configModifyModal.show(profileButton, profileName, profileData);
    });
}

$(() => {
    initialize();
    configModifyModal.initialize();
    otpModal.initialize();

    registerEvent();
    configModifyModal.registerEvent();
    otpModal.registerEvent();
});
