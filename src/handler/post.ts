import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';

/**
 * Lambda Handler
 *
 * @param {APIGatewayProxyEvent} event
 *  PathParam should have following structure: /{table}
 *  Body should consist of proper JSON object.
 * @param {Context} context
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const logger: Logger = createLogger(event, context);
  const pathParams: Record<string, string> = event.pathParameters;

  try {
    const { table } = pathParams;
    const { body } = event;
    const item: Record<string, unknown> = <Record<string, unknown>> JSON.parse(body);
    logger.info(`Post: ${JSON.stringify({ pathParams, item })}`);

    await dynamodb.create(item, table);

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
