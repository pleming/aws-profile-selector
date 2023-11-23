import Constants from "./const.js";

const initialize = () => {
    globalData[Constants.LOCAL_STORAGE.AWS_CONFIG] = JSON.parse(localStorage.getItem(Constants.LOCAL_STORAGE.AWS_CONFIG)) || {};
};

export const globalData = {
    [Constants.LOCAL_STORAGE.AWS_CONFIG]: {},
    initialize
};
