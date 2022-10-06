CREATE TABLE suggestions (
    guild_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    approves INTEGER(255) NOT NULL DEFAULT "0",
    rejects INTEGER(255) NOT NULL DEFAULT "0",
    sended_at VARCHAR(255) NOT NULL,
    id INTEGER(255) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    ended TINYINT(1) NOT NULL DEFAULT "0",
    suggestion VARCHAR(255) NOT NULL,
    votes LONGTEXT NOT NULL DEFAULT "[]"
);

CREATE TABLE jokes (
    guild_id VARCHAR(255) NOT NULL,
    data LONGTEXT DEFAULT '{"global": true, "dark": false, "dev": true, "limit": false, "beauf": true, "blondes": true}'
);