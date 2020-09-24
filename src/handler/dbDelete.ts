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
  const queryParams: Record<string, string> = event.queryStringParameters;

  try {
    const { id, table } = pathParams;
    const { keyName } = queryParams;

    const response = await dynamodb.remove({ [keyName]: id }, table);

    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
