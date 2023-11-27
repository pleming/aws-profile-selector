class LoadingIndicator {
    #win;
    #targetFunction;
    #args;

    constructor(win, targetFunction, args) {
        this.#win = win;
        this.#targetFunction = targetFunction;
        this.#args = args;
    }

    async invoke() {
        try {
            this.#win.webContents.send("loading:indicate", {
                "isCompleted": false
            });

            const response = await this.#targetFunction(this.#args);

            this.#win.webContents.send("loading:indicate", {
                "isCompleted": true
            });

            return response;
        } catch (error) {
            this.#win.webContents.send("loading:indicate", {
                "isCompleted": true
            });

            throw error;
        }
    }
}

exports = module.exports = LoadingIndicator;
