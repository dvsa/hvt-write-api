import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AttributeValue } from 'aws-sdk/clients/dynamodb';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';

/**
 * Lambda Handler
 *
 * @param {APIGatewayProxyEvent} event
 *  PathParam should have following structure: /{table}/{id}
 * @param {Context} context
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const logger: Logger = createLogger(event, context);
  const pathParams: Record<string, string> = event.pathParameters;
  const queryParams: Record<string, string> = event.queryStringParameters;
  logger.info(`Delete: ${JSON.stringify({ pathParams, queryParams })}`);

  try {
    const id: AttributeValue = <AttributeValue> pathParams.id;
    const { table } = pathParams;
    const { keyName = 'id' } = queryParams;

    await dynamodb.remove({ [keyName]: id }, table);

    return {
      statusCode: 203,
      body: null,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
