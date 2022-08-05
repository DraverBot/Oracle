class VigenereCrypt {
    /**
     * @param {String} text 
     * @param {String} key
     * @param {String} action
     * @description Use code at action for code a texte, else use decode
     */
    constructor(text, key, action) {
        this.text = text.toLowerCase();
        this.key = key.toLowerCase();
        this.result = "";;
        this.code = action == "decode" ? false : true;
        this.letters = "abcdefghifklmnopqrstuvwxyz0123456789&é\"#'{(|[-è`_\\ç^à@)]°+=}*µ$£¤!§:/;.,?<> ";
        this.unknown = "?"
    };
    run() {
        let key = 0;

        for (let i = 0; i < this.text.length; i++) {
            let letterIndex = this.letters.indexOf(this.text[i]);
            let keyIndex = this.letters.indexOf(this.key[key]);

            key++;
            if (key > this.key.length) key = 0;

            let combine = this.code == true ? letterIndex + keyIndex : letterIndex - keyIndex;

            let letter;

            if (combine > this.letters.length - 1) {
                letter = (this.letters + this.letters)[combine];
            } else if (combine < 0) {
                combine = this.letters.length - parseInt(combine.toString().slice(1));
                letter = this.letters[combine];
            } else {
                letter = this.letters[combine];
            };

            this.result+=letter;

        };

        const regex = new RegExp('undefined', 'g');

        this.result = this.result.replace(regex, this.unknown);
        return this.result;
    }
};

module.exports = VigenereCrypt;