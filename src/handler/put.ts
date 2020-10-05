import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, AttributeValue, Context,
} from 'aws-lambda';
import { createLogger, Logger } from '../util/logger';
import * as dynamodb from '../service/dynamodb.service';

/**
 * Lambda Handler
 *
 * @param {APIGatewayProxyEvent} event
 *  PathParam should have following structure: /{table}/{id}
 *  Body should consist of proper JSON object.
 * @param {Context} context
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const logger: Logger = createLogger(event, context);
  const pathParams: Record<string, string> = event.pathParameters;
  const queryParams: Record<string, string> = event.queryStringParameters;

  try {
    const id: AttributeValue = <AttributeValue> pathParams.id;
    const { table } = pathParams;
    const { keyName } = queryParams;
    const { body } = event;
    const data: Record<string, unknown> = <Record<string, unknown>> JSON.parse(body);

    const res = await dynamodb.update({ [keyName]: id }, data, table);

    return {
      statusCode: 200,
      body: JSON.stringify(res.Attributes),
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
