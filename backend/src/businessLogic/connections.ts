import { createLogger } from "./../utils/logger";
import { ConnectionsAccess } from './../dataLayer/connectionsAccess';

const logger = createLogger("Connections:Business Logic: ");

const connectionsAccess = new ConnectionsAccess();

export async function createConnection(connectionId) {
    logger.info("createConnection: ", { connectionId });

    const timestamp = new Date().toISOString();

    return await connectionsAccess.createConnection({
        id: connectionId,
        timestamp
    });
}

export async function deleteConnection(connectionId) {
    logger.info("createConnection: ", { connectionId });

    return await connectionsAccess.deleteConnection({
        id: connectionId
    });
}