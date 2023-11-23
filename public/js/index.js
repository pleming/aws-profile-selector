import configModifyModal from "./modal/config-modify-modal.js";
import { globalData } from "./common/global-data.js";

const initialize = () => {
    globalData.initialize();

    $("#btnNewConfig").attr("disabled", true);

    $(".btn-group-profile button").each((idx, elem) => {
        $(elem).attr("disabled", true);
    });
};

const registerEvent = () => {
    $("#switchOverwriteAgreement").click((event) => {
        $("#btnNewConfig").attr("disabled", !($(event.target).is(":checked")));

        $(".btn-group-profile button").each((idx, elem) => {
            $(elem).attr("disabled", !($(event.target).is(":checked")));
        })
    });

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
