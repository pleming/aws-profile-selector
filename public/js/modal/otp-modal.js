import Constants from "../common/const.js";
import profileService from "../service/profile-service.js";

let triggerProfileId;

const initialize = () => {
    $("#otpModal .modal-body input").each((idx, elem) => {
        $(elem).val("");
    });
};

const show = (profileId) => {
    initialize();
    triggerProfileId = profileId;
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

    if (!await profileService.selectMFAProfile(triggerProfileId, otp)) {
        return;
    }

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
