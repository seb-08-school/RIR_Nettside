const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    const navn = req.body["tekst"];

    const client = TableClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
        "Klasser"
    );

    try {
        await client.deleteEntity("RIR_Aarodal", navn);

        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (err) {
        context.res = {
            status: 404,
            body: { error: "Klasse ikke funnet" }
        };
    }
};
