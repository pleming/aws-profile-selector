import profileService from "../service/profile-service.js";
import Constants from "../common/const.js";

let profile;
let profileButton;
let triggeredBy;

const initialize = () => {
    $("#switchActivateMfaArn").prop("checked", false);
    $("#inputMfaArn").prop("disabled", true);

    $("#profileModifyModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (eventTarget) => {
    triggeredBy = Constants.TRIGGER.NEW_PROFILE;

    if (eventTarget) {
        const profileName = eventTarget.text();
        const profileData = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE][profileName];

        triggeredBy = Constants.TRIGGER.MODIFY_PROFILE;
        profileButton = eventTarget;

        profile = { profileName, profileData };

        $("input[name=inputProfileName]").val(profileName);
        $("input[name=inputRegion]").val(profileData[Constants.AWS_PROPERTY.REGION]);
        $("input[name=inputAccessKeyId]").val(profileData[Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]);
        $("input[name=inputAccessKey]").val(profileData[Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]);
        $("#inputMfaArn").val(profileData[Constants.AWS_PROPERTY.MFA_ARN]);
        $("#switchActivateMfaArn").prop("checked", profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
        $("#inputMfaArn").prop("disabled", !profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));

        $("#profileModifyModalLabel").text("Modify profile");
    } else {
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

    const newProfileName = $("input[name=inputProfileName]").val();

    if (!newProfileName) {
        window.electronDialog.alert("Profile name is empty");
        return;
    }

    const awsProfile = profileService[Constants.LOCAL_STORAGE.AWS_PROFILE];

    if (triggeredBy === Constants.TRIGGER.NEW_PROFILE && awsProfile.hasOwnProperty(newProfileName)) {
        window.electronDialog.alert("Duplicated profile name");
        return;
    }

    const newProfile = {
        [Constants.AWS_PROPERTY.REGION]: $("input[name=inputRegion]").val(),
        [Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]: $("input[name=inputAccessKeyId]").val(),
        [Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]: $("input[name=inputAccessKey]").val()
    };

    const isMfaProfile = $("#switchActivateMfaArn").is(":checked");

    if (isMfaProfile) {
        newProfile[Constants.AWS_PROPERTY.MFA_ARN] = $("#inputMfaArn").val();
    }

    for (const key in newProfile) {
        if (!newProfile[key]) {
            window.electronDialog.alert(`${key} is empty`);
            console.log();
            return;
        }
    }

    if (triggeredBy === Constants.TRIGGER.NEW_PROFILE) {
        profileService.appendProfile(newProfileName, isMfaProfile);
    } else if (triggeredBy === Constants.TRIGGER.MODIFY_PROFILE) {
        delete awsProfile[profile.profileName];
        profileButton.text(newProfileName);
    }

    awsProfile[newProfileName] = newProfile;
    profileService.saveProfile(awsProfile);

    hide();
    initialize();
};

const registerEvent = () => {
    $("#switchActivateMfaArn").click((event) => {
        $("#inputMfaArn").prop("disabled", !$(event.target).is(":checked"));
    });

    $("#btnSaveProfile").click(async () => {
        await saveProfile();
    });

    $("#btnProfileModifyModalCancel").click(async () => {
        await closeProfileModifyModal();
    });

    $("#btnProfileModifyModalClose").click(async () => {
        await closeProfileModifyModal();
        hide();
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

    if (triggeredBy === Constants.TRIGGER.NEW_PROFILE) {
        confirmNotice = "new profile";
    } else if (triggeredBy === Constants.TRIGGER.MODIFY_PROFILE) {
        confirmNotice = "profile modification";
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
