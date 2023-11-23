import configModifyModal from "./modal/config-modify-modal.js";
import { globalData } from "./common/global-data.js";

const initialize = () => {
    globalData.initialize();
};

const registerEvent = () => {
    $("#btnNewConfig").click(() => {
        configModifyModal.initialize();
        configModifyModal.show();
    });

    $(".profile-button-container").on("click", ".btn-config-modify", () => {
        configModifyModal.show();
    });
}

$(() => {
    initialize();
    registerEvent();
    configModifyModal.registerEvent();
});
