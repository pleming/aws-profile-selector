import Constants from "../common/const.js";
import profileService from "../service/profile-service.js";

let profileButton;
let profile;

const initialize = () => {
    $("#otpModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (eventTarget, profileName, profileData) => {
    profileButton = eventTarget;

    if (profileName && profileData) {
        profile = { profileName, profileData };
    }

    $("#otpModal").modal("show");
};

const hide = () => {
    $("#otpModal").modal("hide");
};

const registerEvent = () => {
    $("#btnConfirmOTP").click(async () => {
        const otp = $("input[name=inputOTP]").val();

        if (!otp) {
            window.electronDialog.alert("OTP is empty");
            return;
        }

        const response = await window.electronProfile.setupMFAProfile(profile, otp);

        if (!response.status) {
            window.electronDialog.alert(response.message);
            return;
        }

        window.electronDialog.alert(response.message);

        profileService.selectProfile(profileButton);

        hide();
        initialize();
    });

    $("#btnOTPModalCancel").click(async () => {
        await closeOTPModal();
    });

    $("#btnOTPModalClose").click(async () => {
        await closeOTPModal();
    });
};

const closeOTPModal = async () => {
    const response = await window.electronDialog.confirm("Cancel OTP input");

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
