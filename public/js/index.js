import configModifyModal from "./modal/config-modify-modal.js";

const registerEvent = () => {
    $(".profile-button-container").on("click", ".btn-config-modify", () => {
        configModifyModal.show();
    });
}

$(() => {
    registerEvent();
    configModifyModal.registerEvent();
});
