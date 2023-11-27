const loading = (loadingTitle) => {
    $("#loadingIndicatorTitle").text(loadingTitle);
    $(".loading-container").show();

    window.electronLoading.indicator((response) => {
        if (response.isCompleted) {
            window.electronLoading.removeIndicator();

            $("#loadingIndicatorTitle").text("");
            $("#loadingIndicatorBody").text("");
            $(".loading-container").hide();

            return;
        }

        $("#loadingIndicatorBody").text(response.message);
    });
};

export default {
    loading
};
