const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    const klasse = req.body;

    const client = TableClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
        "Klasser"
    );

    const entity = {
        partitionKey: "RIR_Aarodal",
        rowKey: klasse.navn,
        info: JSON.stringify(klasse.info)
    };

    try {
        await client.createEntity(entity);
    } catch (err) {
        // Hvis den finnes fra før → oppdater
        await client.upsertEntity(entity);
    }

    context.res = {
        status: 200,
        body: { success: true }
    };
};
