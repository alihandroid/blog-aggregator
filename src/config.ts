import fs from "fs";
import os from "os";
import path from "path";

const CONFIG_FILE = ".gatorconfig.json";

export type Config = {
    dbUrl: string;
    currentUserName: string;
};

function getConfigFilePath() {
    const home = os.homedir();
    return path.join(home, CONFIG_FILE);
}

function writeConfig(config: Config) {
    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    }

    let data = JSON.stringify(rawConfig);
    fs.writeFileSync(getConfigFilePath(), data, { encoding: 'utf-8' })
}

function validateConfig(rawConfig: any) {
    if (typeof rawConfig.db_url !== "string") {
        throw new Error("db_url missing in ~/.gatorconfig.json");
    }

    if (typeof rawConfig.current_user_name !== "string") {
        throw new Error("current_user_name missing in ~/.gatorconfig.json");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    }

    return config;
}

export function setUser(username: string) {
    let config = readConfig();
    config.currentUserName = username;

    writeConfig(config);
}

export function readConfig() {
    const data = fs.readFileSync(getConfigFilePath(), { encoding: 'utf-8' });
    const rawConfig = JSON.parse(data);

    return validateConfig(rawConfig);
}