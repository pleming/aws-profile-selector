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

export default {
    [Constants.LOCAL_STORAGE.AWS_PROFILE]: JSON.parse(localStorage.getItem(Constants.LOCAL_STORAGE.AWS_PROFILE)) || {},
    appendProfile,
    saveProfile
};
