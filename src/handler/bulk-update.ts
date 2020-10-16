import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, AttributeValue, Context,
} from 'aws-lambda';

import { parsePayload } from '../lib/bulk-update';
import { update } from '../service/dynamodb.service';
import { createLogger, Logger } from '../util/logger';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const logger: Logger = createLogger(event, context);
  const pathParams: Record<string, string> = event.pathParameters;
  const { table } = pathParams;
  const { body: requestBody } = event;

  const payload = parsePayload(requestBody);

  const promises = payload.map((itemUpdateData) =>
  // eslint-disable-next-line implicit-arrow-linebreak
    update('id', itemUpdateData.id as AttributeValue, itemUpdateData.update, table)
      .then(() => ({ id: itemUpdateData.id, result: 'success' }))
      .catch(() => ({ id: itemUpdateData.id, result: 'failure' })));

  const results = await Promise.all(promises);
  const successful = results.filter((job) => job.result === 'success').map(({ id }) => id);
  const failed = results.filter((job) => job.result === 'failure').map(({ id }) => id);

  if (promises.length === successful.length) {
    logger.info('Bulk update: All records updated successfully.');
  } else {
    logger.warn(`Bulk update: Could not update the following items: ${failed.join(', ')}`);
  }

  // eslint-disable-next-line max-len
  const message = `Bulk update: Items processed: ${promises.length}, updated: ${successful.length}, failed: ${failed.length}.`;
  logger.info(message);

  return {
    statusCode: 200,
    body: message,
  };
};
