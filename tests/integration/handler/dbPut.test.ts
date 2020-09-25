/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  test('should throw an error when wrong params', async () => {
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
    const params = dynamoHelper.getCreateTableParams('id', TEST_TABLE) as any;
    await dynamoHelper.createTable(params);
  });

  beforeEach(async () => {
    const deleteParams = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);

    const createParams = dynamoHelper.getCreateTableParams('id', TEST_TABLE) as any;
    await dynamoHelper.createTable(createParams);
  });

  afterAll(async () => {
    const deleteParams = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);
  });
});
