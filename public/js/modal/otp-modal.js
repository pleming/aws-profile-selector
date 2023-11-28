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
    initialize();

    profileButton = eventTarget;

    if (profileName && profileData) {
        profile = { profileName, profileData };
    }

    $("#otpModal").modal("show");
};

const hide = () => {
    $("#otpModal").modal("hide");
};

const confirmOTP = async () => {
    const otp = $("input[name=inputOTP]").val();

    if (!otp) {
        window.electronDialog.error("OTP is empty");
        return;
    }

    const response = await window.electronProfile.setupMFAProfile(profile, otp);

    if (!response.status) {
        window.electronDialog.error(response.message);

        const inputOTPElem = $("input[name=inputOTP]");
        inputOTPElem.val("");
        inputOTPElem.focus();

        profileService.releaseProfile();
        return;
    }

    window.electronDialog.info(response.message);

    profileService.selectProfile(profileButton);

    hide();
    initialize();
};

const registerEvent = () => {
    $("#btnConfirmOTP").click(async () => {
        await confirmOTP();
    });

    $("#btnOTPModalCancel").click(async () => {
        await closeOTPModal();
    });

    $("#btnOTPModalClose").click(async () => {
        await closeOTPModal();
    });

    $("#inputOTP").on("keypress", async (event) => {
        if (event.keyCode === 13) {
            await confirmOTP();
        }
    });

    $("#otpModal").on("shown.bs.modal", () => {
        $("#inputOTP").focus();
    });
};

const closeOTPModal = async () => {
    const response = await window.electronDialog.confirm("Cancel OTP input");

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
