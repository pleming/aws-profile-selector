import Constants from "../common/const.js";

const profileButtonHTML =
    `<div class="btn-group btn-group-block btn-group-profile">
        <button type="button" class="btn btn-outline-primary btn-profile"></button>
        <button type="button" class="btn btn-outline-primary dropdown-toggle dropdown-toggle-split btn-split-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item btn-profile-modify" href="#">Modify</a></li>
            <li><a class="dropdown-item btn-profile-delete" href="#">Delete</a></li>
        </ul>
    </div>`;

const appendProfile = (profileName) => {
    const profileButton = $($.parseHTML(profileButtonHTML));

    profileButton.find(".btn-profile").text(profileName);
    $(".profile-button-container").append(profileButton);
};

const saveProfile = (awsProfile) => {
    localStorage.setItem(Constants.LOCAL_STORAGE.AWS_PROFILE, JSON.stringify(awsProfile));
};

const selectProfile = (profileButton) => {
    $(".btn-group-profile").each((idx, groupElem) => {
        $(groupElem).find("button").each((idx, buttonElem) => {
            $(buttonElem).removeClass("btn-success");
            $(buttonElem).addClass("btn-outline-primary");
        });
    });

    profileButton.parent(".btn-group-profile").find("button").each((idx, elem) => {
        $(elem).removeClass("btn-outline-primary");
        $(elem).addClass("btn-success");
    });
};

const releaseProfile = () => {
    localStorage.removeItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);

    $(".btn-group-profile").each((idx, groupElem) => {
        $(groupElem).find("button").each((idx, buttonElem) => {
            $(buttonElem).removeClass("btn-success");
            $(buttonElem).addClass("btn-outline-primary");
        });
    });
};

const isSelectedProfile = (profileName) => {
    const selectedProfile = localStorage.getItem(Constants.LOCAL_STORAGE.SELECTED_PROFILE);
    return selectedProfile === profileName;
};

export default {
    [Constants.LOCAL_STORAGE.AWS_PROFILE]: JSON.parse(localStorage.getItem(Constants.LOCAL_STORAGE.AWS_PROFILE)) || {},
    appendProfile,
    saveProfile,
    selectProfile,
    releaseProfile,
    isSelectedProfile
};
