const initialize = () => {
    $("#switchOverwritePolicy").prop("checked", false);
    switchToSAgreement(false);
};

const switchToSAgreement = (isAgreePolicy) => {
    $("#btnNewProfile").attr("disabled", !isAgreePolicy);

    $(".btn-group-profile button").each((idx, elem) => {
        $(elem).attr("disabled", !isAgreePolicy);
    });
};

const registerEvent = () => {
    $("#switchOverwritePolicy").click((event) => {
        switchToSAgreement($(event.target).is(":checked"));
    });
};

export default {
    initialize,
    switchToSAgreement,
    registerEvent
};
