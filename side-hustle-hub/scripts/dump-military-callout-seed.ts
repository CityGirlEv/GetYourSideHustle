import { ensureMilitaryVeteranCalloutTask } from "../src/lib/gysh-tasks.ts";

const { created } = ensureMilitaryVeteranCalloutTask([]);
process.stdout.write(JSON.stringify(created, null, 0));
