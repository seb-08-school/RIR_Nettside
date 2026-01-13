const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        context.log("Connection string:", process.env.AZURE_STORAGE_CONNECTION_STRING);
        
        const client = TableClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING,
            "Klasser"
        );

        const result = [];
        for await (const entity of client.listEntities({
            queryOptions: { filter: "PartitionKey eq 'RIR_Aarodal'" }
        })) {
            result.push( {
                "navn": entity.rowKey,
                "info": JSON.parse(entity.info || "[]")
            });
        }

        context.res = {
            status: 200,
            body: result
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
};
