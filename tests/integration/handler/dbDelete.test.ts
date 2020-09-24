/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context, APIGatewayEventRequestContext,
} from 'aws-lambda';
import { v4 } from 'uuid';
import { handler } from '../../../src/handler/dbDelete';
import * as dynamoHelper from '../test-helpers/dynamo.helper';

const TEST_TABLE = 'TEST_TABLE_DELETE';

const EXPECTED1 = { id: 'test-id-1', attr1: 'test-attr-1' };
const EXPECTED2 = { id: 'test-id-2', attr1: 'test-attr-2' };

describe('DELETE Lambda Function', () => {
  test('should return 201 when item DELETED successfully', async () => {
    const pathParameters: Record<string, string> = { table: TEST_TABLE, id: EXPECTED1.id };
    const queryStringParameters: Record<string, string> = { keyName: 'id' };
    const requestContext: APIGatewayEventRequestContext = <APIGatewayEventRequestContext> { requestId: v4() };
    const body = JSON.stringify(EXPECTED1);
    const headers: Record<string, string> = {};
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> {
      pathParameters,
      queryStringParameters,
      requestContext,
      headers,
      body,
    };
    const contextMock: Context = <Context> { awsRequestId: v4() };
    await dynamoHelper.put(EXPECTED1, TEST_TABLE);
    await dynamoHelper.put(EXPECTED2, TEST_TABLE);

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    const items = await dynamoHelper.getAll(TEST_TABLE);

    expect(res.statusCode).toBe(201);
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(EXPECTED2);
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
