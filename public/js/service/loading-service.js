const initialize = () => {
    $("#loadingIndicatorTitle").text("");
    $("#loadingIndicatorBody").text("");
    $(".loading-container").hide();
};

const startLoading = (title, body) => {
    $("#loadingIndicatorTitle").text(title);
    $("#loadingIndicatorBody").text(body);
    $(".loading-container").show();
};

const endLoading = () => {
    initialize();
};

export default {
    initialize,
    startLoading,
    endLoading
};
