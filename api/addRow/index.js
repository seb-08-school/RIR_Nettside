const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        const [row, klasse] = req.body;

        const client = TableClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING,
            "Klasser"
        );

        klasse.info.push(row);

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
            status: 500,
            body: "Internal Server Error"
        };
    }
};

