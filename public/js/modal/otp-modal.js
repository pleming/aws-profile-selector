import Constants from "../common/const.js";

let profile;

const initialize = () => {
    $("#otpModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (profileName, profileData) => {
    if (profileName && profileData) {
        profile = { profileName, profileData };
    }

    $("#otpModal").modal("show");
};

const hide = () => {
    $("#otpModal").modal("hide");
};

const registerEvent = () => {
    $("#btnConfirmOTP").click(() => {
        const otp = $("input[name=inputOTP]").val();

        if (!otp) {
            window.electronDialog.alert("OTP is empty");
            return;
        }

        console.log("AWS Config :", profile);
        console.log("OTP :", otp);

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
