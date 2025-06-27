import { readConfig, setUser } from "./config";

function main() {
    setUser("Alihandroid");
    console.log(readConfig());
}

main();