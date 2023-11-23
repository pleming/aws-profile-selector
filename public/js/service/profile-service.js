const mfaContextMenuHTML =
    `<div class="div-mfa-context-menu">
        <li><a class="dropdown-item btn-input-mfa" href="#">MFA</a></li>
        <li>
            <hr class="dropdown-divider">
        </li>
    </div>`;

const profileButtonHTML =
    `<div class="btn-group btn-group-block">
        <button type="button" class="btn btn-outline-primary btn-split-main"></button>
        <button type="button" class="btn btn-outline-primary dropdown-toggle dropdown-toggle-split btn-split-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item btn-config-modify" href="#">Modify</a></li>
            <li><a class="dropdown-item btn-config-delete" href="#">Delete</a></li>
        </ul>
    </div>`;

const appendProfile = (profileName, isMfaProfile) => {
    const profileButton = $($.parseHTML(profileButtonHTML));

    if (isMfaProfile) {
        profileButton.find(".dropdown-menu").prepend(mfaContextMenuHTML);
    }

    profileButton.find(".btn-split-main").text(profileName);
    $(".profile-button-container").append(profileButton);
};

export default {
    appendProfile
};
