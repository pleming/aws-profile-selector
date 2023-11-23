import { globalData } from "../common/global-data.js";
import profileService from "../service/profile-service.js";
import Constants from "../common/const.js";

const initialize = () => {
    $("#switchActivateMfaArn").prop("checked", false);
    $("#inputMfaArn").prop("disabled", true);

    $("#configModifyModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = () => {
    $("#configModifyModal").modal("show");
};

const hide = () => {
    $("#configModifyModal").modal("hide");
};

const registerEvent = () => {
    $("#switchActivateMfaArn").click((event) => {
        if ($(event.target).is(":checked")) {
            $("#inputMfaArn").prop("disabled", false);
        } else {
            $("#inputMfaArn").prop("disabled", true);
        }
    });

    $("#btnSaveConfig").click(() => {
        const profileName = $("input[name=inputProfileName]").val();

        if (!profileName) {
            console.log("Profile name is null");
            return;
        }

        const awsConfig = globalData[Constants.LOCAL_STORAGE.AWS_CONFIG];

        if (awsConfig.hasOwnProperty(profileName)) {
            console.log("Already exist profile");
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
                console.log(`${key} is null`);
                return;
            }
        }

        awsConfig[profileName] = newConfig;

        localStorage.setItem(Constants.LOCAL_STORAGE.AWS_CONFIG, JSON.stringify(awsConfig));
        profileService.appendProfile(profileName, isMfaProfile);

        hide();
        initialize();
    });

    $("#btnConfigModifyModalCancel").click(() => {
        console.log("Click btnConfigModifyModalCancel");
        hide();
    });

    $("#btnConfigModifyModalClose").click(() => {
        console.log("Click btnConfigModifyModalClose");
        hide();
    });
}

export default {
    initialize,
    show,
    hide,
    registerEvent
};
