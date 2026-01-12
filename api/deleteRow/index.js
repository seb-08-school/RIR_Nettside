const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    const klasse = req.body;

    const client = TableClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
        "Klasser"
    );

    try {
        await client.updateEntity(
            {
                partitionKey: "RIR_Aarodal",
                rowKey: klasse.navn,
                info: JSON.stringify(klasse.info)
            },
            "Replace"
        );

        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (err) {
        context.res = {
            status: 404,
            body: { error: "Klasse ikke funnet", details: err.message }
        };
    }
};
