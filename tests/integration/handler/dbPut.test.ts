import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context, APIGatewayEventRequestContext,
} from 'aws-lambda';
import { v4 } from 'uuid';
import { handler } from '../../../src/handler/dbPut';
import * as dynamoHelper from '../test-helpers/dynamo.helper';

const TEST_TABLE = 'TEST_TABLE_PUT';

const EXPECTED1 = { id: 'test-id-1', attr1: 'test-attr-1' };

describe('PUT Lambda Function', () => {
  test('should return 201 when item PUT successfully', async () => {
    const pathParameters: Record<string, string> = { table: TEST_TABLE };
    const requestContext: APIGatewayEventRequestContext = <APIGatewayEventRequestContext> { requestId: v4() };
    const body = JSON.stringify(EXPECTED1);
    const headers: Record<string, string> = {};
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> {
      pathParameters,
      requestContext,
      headers,
      body,
    };
    const contextMock: Context = <Context> { awsRequestId: v4() };

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    const item = await dynamoHelper.get({ id: EXPECTED1.id }, TEST_TABLE);

    expect(res.statusCode).toBe(201);
    expect(item).toEqual(EXPECTED1);
  });

  test('should rethrow an error', async () => {
    const pathParameters: Record<string, string> = { table: 'TEST_TABLE_NO_EXISTS' };
    const requestContext: APIGatewayEventRequestContext = <APIGatewayEventRequestContext> { requestId: v4() };
    const body = JSON.stringify(EXPECTED1);
    const headers: Record<string, string> = {};
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> {
      pathParameters,
      requestContext,
      headers,
      body,
    };
    const contextMock: Context = <Context> { awsRequestId: v4() };

    await expect(handler(eventMock, contextMock)).rejects.toThrow();
  });

  beforeAll(async () => {
    const params: Record<string, unknown> = dynamoHelper.getCreateTableParams('id', TEST_TABLE);
    await dynamoHelper.createTable(params);
  });

  beforeEach(async () => {
    const deleteParams: Record<string, unknown> = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);

    const createParams: Record<string, unknown> = dynamoHelper.getCreateTableParams('id', TEST_TABLE);
    await dynamoHelper.createTable(createParams);
  });

  afterAll(async () => {
    const deleteParams = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);
  });
});
