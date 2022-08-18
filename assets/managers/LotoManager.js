class LotoManager {
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.cache = new Map();
    }
    convertToObject(data) {
        let x = data;
        x.ended = data.ended == "1";
        ['reward', 'numbers', 'complementaries', 'endsAt'].forEach((y) => x[y] = parseInt(x[y]));

        if (typeof x.json == 'string') x.json = JSON.parse(x.json);
        // x.json.forEach((userData, index) => {
        //     let y = userData;
        //     Object.keys(y).filter(x => typeof x !== "string").forEach((k) => {
        //         y[k] = y[k].map(yy => parseInt(yy));
        //     });

        //     x.json[index] = y;
        // });

        return x;
    }
    convertToSql(data) {
        let x = data;
        x.ended = x.ended == true ? '1':'0';

        if (typeof x.json == 'object') x.json = JSON.stringify(x.json);

        return x
    }
    createQuery(data, exists) {
        let sql = `INSERT INTO loto (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map(x => `'${x}'`).join(', ')})`;

        if (exists == true) sql = `UPDATE loto SET ${Object.keys(data).map(x => `${x}='${data[x]}'`).join(', ')} WHERE guild_id="${data.guild_id}"`;

        return sql;
    }
    validLoto(guildId) {
        let x = this.cache.get(guildId);
        if (!x) {
            return false;
        };
        if (x.ended == true) {
            return false;
        };
        if (x.endsAt <= Date.now()) {
            return false;
        };

        return true;
    }
    validArray(array) {
        if (array.filter(x => x <= 100 && x > 0).length !== array.length) return false;
        array = array.sort();

        let valid = true;
        array.forEach((x, i) => {
            if (array[i + 1] == x) valid = false;
        });
        if (!valid) return false;
        return true;
    }
    /**
     * @param {Number[]} array  the array to tets
     * @param {Number[]} compared  the array that is used for compare
     */
    validArrayCompare(array, compared) {
        let valid = true;
        array.forEach(x => {
            if (compared.includes(x)) valid = false;
        });
        return valid;
    }
    resetCache() {
        this.cache = new Map();
    }
    fillCache() {
        this.db.query(`SELECT * FROM loto`, (err, req) => {
            if (err) throw err;

            for (const data of req) {
                let x = this.convertToObject(data);

                this.cache.set(x.guild_id, x);
            };
        });
    }
    init() {
        this.fillCache();
    }
    /**
     * @param {{ guildId: String, userId: String, numbers: Number[], complementaries: Number[] }} data 
     */
    addParticipation(data) {
        if (!this.validLoto(data.guildId)) return 'invalid loto';
        const loto = this.cache.get(data.guildId);

        if (loto.numbers !== data.numbers?.length) return 'invalid numbers';
        if (loto.complementaries !== data.complementaries?.length) return 'invalid numbers';
        
        if (!this.validArray(data.numbers) || !this.validArray(data.complementaries)) return 'invalid arrays';
        if (!this.validArrayCompare(data.complementaries, data.numbers)) return 'invalid compared';

        if (typeof loto.json == 'string') loto.json = JSON.parse(loto.json);
        if (loto.json.find(x => x.user_id == data.userId)) return 'user already exists';

        loto.json.push({
            user_id: data.userId,
            numbers: data.numbers,
            complementaries: data.complementaries
        });
        this.cache.set(loto.guild_id, loto);
        const sql = this.createQuery(this.convertToSql(loto), true);
        this.db.query(sql, (err) => {if (err) throw err});

        return 'added';
    }
    compareArrays(first, second) {
        let same = false;

        if (second.filter(x => first.includes(x)).length == second.length) same = true;

        return same;
    }
    /**
     * @param {Number[]} first Array generated
     * @param {Number[]} second Array of the user
     * @returns {{matches: Number, total: Number}} total is the length of the first array
     */
    compareComplementariesArrays(first, second) {
        let same = second.filter(x => first.includes(x)).length;

        return {
            matches: same,
            total: first.length
        };
    }
    /**
     * @param {Number[]} map
     */
    random(map) {
        let numbers = [];
        for (let i = 1; i < 100; i++) {
            numbers.push(i);
        };

        numbers = numbers.filter(x => !map.includes(x));
        let random = numbers[Math.floor(Math.random() * numbers.length)];

        map.push(random);
        return random;
    }
    roll(guildId) {
        let loto = this.cache.get(guildId);
        if (typeof loto.ended == 'string') loto = this.convertToObject(loto);

        let numbers = [];
        let complementaries = [];
        let all = [];

        for (let i = 0; i < loto.numbers; i++) {
            numbers.push(this.random(all));
        };
        for (let i = 0; i < loto.complementaries; i++) {
            complementaries.push(this.random(all));
        };

        numbers.sort();
        complementaries.sort();

        let winners = loto.json.filter(x => this.compareArrays(x.numbers, numbers) == true);
        if (winners.length == 0) return { numbers, complementaries, winners: [] };

        let reward = loto.reward;
        if (winners.length == 1) {
            let percent = this.compareComplementariesArrays(complementaries, winners[0].complementaries);
            let total = numbers.length + complementaries.length;

            let winned = (reward * (percent.matches + numbers.length)) / total;
            winners[0].reward = winned;
        } else {
            let splited = reward / winners.length;
            winners.forEach((winner, index) => {
                let percent = this.compareComplementariesArrays(complementaries, winner.complementaries);
                let total = numbers.length + complementaries.length;
    
                let winned = (splited * (percent.matches + numbers.length)) / total;
                winners[index].reward = winned;
            });
        };

        return { numbers, complementaries, winners };
    }
    end(guildId) {
        if (!this.validLoto(guildId)) return 'invalid loto';
        let loto = this.cache.get(guildId);
        loto.ended = true;

        let sql = this.createQuery(this.convertToSql(loto), true);
        this.db.query(sql, (err) => {
            if (err) throw err;

            this.fillCache();
        })

        return this.roll(guildId);
    }
    /**
     * @param {{ numbers: Number, complementaries: Number, guildId: String, time: Number, reward: Number }} data 
     */
    start(data) {
        let x = {
            guild_id: data.guildId,
            numbers: data?.numbers ?? 5,
            complementaries: data?.complementaries ?? 2,
            reward: data.reward,
            endsAt: Date.now() + data.time,
            json: [],
            ended: false
        };

        this.db.query(this.createQuery(this.convertToSql(x), this.cache.has(data.guildId)), (err) => {
            if (err) throw err;

            this.fillCache();
        });
    }
};

module.exports = LotoManager;