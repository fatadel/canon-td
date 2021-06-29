const fs = require("fs");
const Ajv = require("ajv");
const canonifyJSON = require("canonical-json");

if (process.argv.length !== 3) {
    console.error("Please provide a file containing TD to canonicalize as an argument");
    process.exit(-1);
}

const td = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const schema = require("./td-json-schema-validation.json");

const ajv = new Ajv();
ajv.validate(schema, td);

// Interactions
const PROPERTIES = "properties";
const ACTIONS = "actions";
const EVENTS = "events";

function addSecurityDefaults(schemes, key, value) {
    for (const val of Object.values(td["securityDefinitions"])) {
        if (schemes.includes(val["scheme"]) && val[key] === undefined) {
            val[key] = value;
        }
    }
}

function addFormDefaults(interactions) {
    for (const interaction of Object.values(td[interactions] ?? {})) {
        for (const form of Object.values(interaction["forms"])) {
            // Add contentType
            if (form["contentType"] === undefined) {
                form["contentType"] = "application/json";
            }

            // Add interaction-specific values
            if (interactions === "properties") {
                if (interaction["readOnly"] === undefined) {
                    interaction["readOnly"] = false;
                }
                if (interaction["writeOnly"] === undefined) {
                    interaction["writeOnly"] = false;
                }
                if (interaction["observable"] === undefined) {
                    interaction["observable"] = false;
                }
                if (form["op"] === undefined) {
                    if (!interaction["readOnly"] && !interaction["writeOnly"]) {
                        form["op"] = ["readproperty", "writeproperty"];
                    } else if (interaction["readOnly"]) {
                        form["op"] = "readproperty";
                    } else if (interaction["writeOnly"]) {
                        form["op"] = "writeproperty";
                    }
                }
            } else if (interactions === "actions") {
                if (interaction["safe"] === undefined) {
                    interaction["safe"] = false;
                }
                if (interaction["idempotent"] === undefined) {
                    interaction["idempotent"] = false;
                }
                if (form["op"] === undefined) {
                    form["op"] = "invokeaction";
                }
            } else if (interactions === "events") {
                if (form["op"] === undefined) {
                    form["op"] = ["subscribeevent", "unsubscribeevent"];
                }
            }
        }
    }

}

// Populate security default values
addSecurityDefaults(["basic", "digest", "bearer"], "in", "header");
addSecurityDefaults(["apikey"], "in", "query");
addSecurityDefaults(["digest"], "qop", "auth");
addSecurityDefaults(["bearer"], "alg", "ES256");
addSecurityDefaults(["bearer"], "format", "jwt");

// Populate form default values
[PROPERTIES, ACTIONS, EVENTS].forEach((interactions) => addFormDefaults(interactions));

fs.writeFileSync("canonical-td.jsonld", canonifyJSON(td, undefined, 2));
