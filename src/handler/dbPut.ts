import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';

/**
 * Lambda Handler
 *
 * @param {APIGatewayProxyEvent} event
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

    const response = await dynamodb.put(item, table);

    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
