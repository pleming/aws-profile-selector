import profileService from "../service/profile-service.js";
import Constants from "../common/const.js";

let originProfileData;
let triggerType;
let triggerProfileId;

const initialize = () => {
    $("#switchActivateMfaArn").prop("checked", false);
    $("#inputMfaArn").prop("disabled", true);

    $("#profileModifyModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (profileId) => {
    initialize();

    if (profileId) {
        triggerProfileId = profileId;
        triggerType = Constants.TRIGGER.MODIFY_PROFILE;
        originProfileData = profileService.loadProfile(profileId);

        $("input[name=inputProfileName]").val(originProfileData.profileName);
        $("input[name=inputRegion]").val(originProfileData[Constants.AWS_PROPERTY.REGION]);
        $("input[name=inputAccessKeyId]").val(originProfileData[Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]);
        $("input[name=inputAccessKey]").val(originProfileData[Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]);
        $("#inputMfaArn").val(originProfileData[Constants.AWS_PROPERTY.MFA_ARN]);
        $("#switchActivateMfaArn").prop("checked", originProfileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
        $("#inputMfaArn").prop("disabled", !originProfileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));

        $("#profileModifyModalLabel").text("Modify profile");
    } else {
        triggerType = Constants.TRIGGER.NEW_PROFILE;
        $("#profileModifyModalLabel").text("New profile");
    }

    $("#profileModifyModal").modal("show");
};

const hide = () => {
    $("#profileModifyModal").modal("hide");
};

const saveProfile = async () => {
    const response = await window.electronDialog.confirm("Save profile");

    if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
        return;
    }

    const newProfileData = {
        [Constants.ATTR.PROFILE_NAME]: $("input[name=inputProfileName]").val(),
        [Constants.AWS_PROPERTY.REGION]: $("input[name=inputRegion]").val(),
        [Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]: $("input[name=inputAccessKeyId]").val(),
        [Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]: $("input[name=inputAccessKey]").val()
    };

    const isMFAProfile = $("#switchActivateMfaArn").is(":checked");

    if (isMFAProfile) {
        newProfileData[Constants.AWS_PROPERTY.MFA_ARN] = $("#inputMfaArn").val();
    }

    switch (triggerType) {
        case Constants.TRIGGER.NEW_PROFILE:
            const profileId = profileService.insertProfile(newProfileData);
            profileService.appendProfileButton(profileId);
            break;
        case Constants.TRIGGER.MODIFY_PROFILE:
            profileService.updateProfile(triggerProfileId, originProfileData, newProfileData);
            profileService.updateProfileButton(triggerProfileId);
            break;
        default:
            const errorMessage = `Unknown trigger type : ${triggerType}`;
            window.electronDialog.error(errorMessage);
            throw new Error(errorMessage);
    }

    hide();
    initialize();
};

const registerEvent = () => {
    $("#switchActivateMfaArn").click((event) => {
        $("#inputMfaArn").prop("disabled", !($(event.target).is(":checked")));
    });

    $("#btnSaveProfile").click(async () => {
        await saveProfile();
    });

    $("#btnProfileModifyModalCancel").click(async () => {
        await closeProfileModifyModal();
    });

    $("#btnProfileModifyModalClose").click(async () => {
        await closeProfileModifyModal();
    });

    $(".input-profile-modify").on("keypress", async (event) => {
        if (event.keyCode === 13) {
            await saveProfile();
        }
    });

    $("#profileModifyModal").on("shown.bs.modal", () => {
        $("#inputProfileName").focus();
    });
};

const closeProfileModifyModal = async () => {
    let confirmNotice;

    switch (triggerType) {
        case Constants.TRIGGER.NEW_PROFILE:
            confirmNotice = "new profile";
            break;
        case Constants.TRIGGER.MODIFY_PROFILE:
            confirmNotice = "profile modification";
            break;
        default:
            const errorMessage = `Unknown trigger type : ${triggerType}`;
            window.electronDialog.error(errorMessage);
            throw new Error(errorMessage);
    }

    const response = await window.electronDialog.confirm(`Cancel ${confirmNotice}`);

    if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
        return;
    }

    hide();
    initialize();
};

export default {
    initialize,
    show,
    hide,
    registerEvent
};
