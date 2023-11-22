const show = () => {
    $("#configModifyModal").modal("show");
};

const hide = () => {
    $("#configModifyModal").modal("hide");
};

const registerEvent = () => {
    $("#btnSaveConfig").click(() => {
        console.log("Click btnSaveConfig");
        hide();
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
    show,
    registerEvent
};
