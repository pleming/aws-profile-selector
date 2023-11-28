import profileService from "../service/profile-service.js";
import Constants from "../common/const.js";

let triggerProfileId;

const initialize = () => {
    const confirmTextElem = $("#inputDeleteProfileConfirmText");

    confirmTextElem.val("");
    confirmTextElem.removeAttr("placeholder");

    $("#deleteProfileName").text("");
};

const show = (profileId) => {
    const { profileName } = profileService.loadProfile(profileId);

    triggerProfileId = profileId;

    $("#deleteProfileName").text(profileName);
    $("#inputDeleteProfileConfirmText").attr("placeholder", profileName);

    $("#profileDeleteModal").modal("show");
};

const hide = () => {
    $("#profileDeleteModal").modal("hide");
};

const deleteProfile = async () => {
    const response = await window.electronDialog.confirm("Delete profile");

    if (response === Constants.ELECTRON_DIALOG.CONFIRM.NO) {
        return;
    }

    const { profileName } = profileService.loadProfile(triggerProfileId);

    if (profileName !== $("#inputDeleteProfileConfirmText").val()) {
        window.electronDialog.error("Profile name is mismatch");
        return;
    }

    if (profileService.isSelectedProfile(triggerProfileId)) {
        profileService.releaseProfile();
    }

    profileService.deleteProfile(triggerProfileId);
    profileService.removeProfileButtonGroup(triggerProfileId);

    hide();
    initialize();
};

const registerEvent = () => {
    $("#btnConfirmDeleteProfile").click(async () => {
        await deleteProfile();
    });

    $("#btnCancelDeleteProfile").click(async () => {
        await closeProfileDeleteModal();
    });

    $("#profileDeleteModalClose").click(async () => {
        await closeProfileDeleteModal();
    });

    $("#inputDeleteProfileConfirmText").on("keypress", async (event) => {
        if (event.keyCode === 13) {
            await deleteProfile();
        }
    });

    $("#profileDeleteModal").on("shown.bs.modal", () => {
        $("#inputDeleteProfileConfirmText").focus();
    });
};

const closeProfileDeleteModal = async () => {
    const response = await window.electronDialog.confirm("Cancel profile removal");

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
