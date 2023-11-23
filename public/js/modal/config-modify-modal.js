import profileService from "../service/profile-service.js";
import Constants from "../common/const.js";

let profile;
let profileButton;
let triggeredBy;

const initialize = () => {
    $("#switchActivateMfaArn").prop("checked", false);
    $("#inputMfaArn").prop("disabled", true);

    $("#configModifyModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (eventTarget, profileName, profileData) => {
    profileButton = eventTarget;

    if (profileName && profileData) {
        triggeredBy = Constants.TRIGGER.MODIFY_CONFIG;

        profile = { profileName, profileData };

        $("input[name=inputProfileName]").val(profileName);
        $("input[name=inputRegion]").val(profileData[Constants.AWS_PROPERTY.REGION]);
        $("input[name=inputAccessKeyId]").val(profileData[Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]);
        $("input[name=inputAccessKey]").val(profileData[Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]);
        $("#inputMfaArn").val(profileData[Constants.AWS_PROPERTY.MFA_ARN]);
        $("#switchActivateMfaArn").prop("checked", profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
        $("#inputMfaArn").prop("disabled", !profileData.hasOwnProperty(Constants.AWS_PROPERTY.MFA_ARN));
    }

    $("#configModifyModal").modal("show");
};

const hide = () => {
    $("#configModifyModal").modal("hide");
};

const registerEvent = () => {
    $("#switchActivateMfaArn").click((event) => {
        $("#inputMfaArn").prop("disabled", !$(event.target).is(":checked"));
    });

    $("#btnSaveConfig").click(() => {
        const newProfileName = $("input[name=inputProfileName]").val();

        if (!newProfileName) {
            window.electronDialog.alert("Profile name is empty");
            return;
        }

        const awsConfig = profileService[Constants.LOCAL_STORAGE.AWS_CONFIG];

        if (triggeredBy === Constants.TRIGGER.NEW_CONFIG && awsConfig.hasOwnProperty(newProfileName)) {
            window.electronDialog.alert("Duplicated profile name");
            return;
        }

        const newConfig = {
            [Constants.AWS_PROPERTY.REGION]: $("input[name=inputRegion]").val(),
            [Constants.AWS_PROPERTY.AWS_ACCESS_KEY_ID]: $("input[name=inputAccessKeyId]").val(),
            [Constants.AWS_PROPERTY.AWS_SECRET_ACCESS_KEY]: $("input[name=inputAccessKey]").val()
        };

        const isMfaProfile = $("#switchActivateMfaArn").is(":checked");

        if (isMfaProfile) {
            newConfig[Constants.AWS_PROPERTY.MFA_ARN] = $("#inputMfaArn").val();
        }

        for (const key in newConfig) {
            if (!newConfig[key]) {
                window.electronDialog.alert(`${key} is empty`);
                console.log();
                return;
            }
        }

        if (triggeredBy === Constants.TRIGGER.NEW_CONFIG) {
            profileService.appendProfile(newProfileName, isMfaProfile);
        } else if (triggeredBy === Constants.TRIGGER.MODIFY_CONFIG) {
            delete awsConfig[profile.profileName];
            profileButton.text(newProfileName);
        }

        awsConfig[newProfileName] = newConfig;
        localStorage.setItem(Constants.LOCAL_STORAGE.AWS_CONFIG, JSON.stringify(awsConfig));

        hide();
        initialize();
    });

    $("#btnConfigModifyModalCancel").click(async () => {
        await closeConfigModifyModal();
    });

    $("#btnConfigModifyModalClose").click(async () => {
        await closeConfigModifyModal();
        hide();
    });
};

const closeConfigModifyModal = async () => {
    const response = await window.electronDialog.confirm("Cancel configuration");

    if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
        return;
    }

    hide();
};

export default {
    initialize,
    show,
    hide,
    registerEvent
};
