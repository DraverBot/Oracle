CREATE TABLE configs (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    logs_enable TINYINT(1) NOT NULL DEFAULT "0",
    suggest_enables TINYINT(1) NOT NULL DEFAULT "0",
    welcome_enable TINYINT(1) NOT NULL DEFAULT "0",
    welcome_message VARCHAR(2048) NOT NULL DEFAULT "",
    leave_enable TINYINT(1) NOT NULL DEFAULT "0",
    leave_message VARCHAR(2048) NOT NULL DEFAULT "",
    gban_enable TINYINT(1) NOT NULL DEFAULT "1",
    autoroles_enable TINYINT(1) NOT NULL DEFAULT "0"
);
CREATE TABLE channels (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    suggest_channel TEXT NOT NULL DEFAULT "",
    levels_channels TEXT NOT NULL DEFAULT "",
    welcome_channel TEXT NOT NULL DEFAULT "",
    leave_channel TEXT NOT NULL DEFAULT ""
);
CREATE TABLE logs_channels (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    roles TEXT NOT NULL,
    channels TEXT NOT NULL,
    moderation TEXT NOT NULL,
    guild TEXT NOT NULL,
    members TEXT NOT NULL,
    users TEXT NOT NULL
);
CREATE TABLE modules (
    guild_id VARCHAR(255) NOT NULL PRIMARY KEY,
    information TINYINT(1) NOT NULL DEFAULT "1",
    moderation TINYINT(1) NOT NULL DEFAULT "1",
    giveaways TINYINT(1) NOT NULL DEFAULT "1",
    usefull TINYINT(1) NOT NULL DEFAULT "1",
    fun TINYINT(1) NOT NULL DEFAULT "1", 
    tickets TINYINT(1) NOT NULL DEFAULT "0",
    misc TINYINT(1) NOT NULL DEFAULT "0"
    levels TINYINT(1) NOT NULL DEFAULT "0",
    economy TINYINT(1) NOT NULL DEFAULT "0"
);
CREATE TABLE autoroles (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL
);
CREATE TABLE levels (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    messages INTEGER NOT NULL DEFAULT "0",
    objectif INTEGER NOT NULL DEFAULT "50",
    total INTEGER NOT NULL DEFAULT "0"
);
CREATE TABLE mod_cases (
    guild_id TEXT NOT NULL,
    action TEXT NOT NULL,
    mod_id TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT NOT NULL,
    image TEXT NOT NULL,
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY
);
CREATE TABLE shop (
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    extra LONGTEXT NOT NULL DEFAULT '{}',
    type TEXT NOT NULL DEFAULT "text",
    price INTEGER NOT NULL,
    quantity NOT NULL DEFAULT "0",
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY
);