import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context, APIGatewayEventRequestContext, AttributeValue,
} from 'aws-lambda';
import { v4 } from 'uuid';
import { handler } from '../../../src/handler/put';
import * as dynamoHelper from '../test-helpers/dynamo.helper';

const TEST_TABLE = 'TEST_TABLE_PUT';
const EXPECTED1 = { id: 'test-id-1', attr1: 'test-attr-1', attr2: 'test-attr-2' };

describe('PUT Lambda Function', () => {
  test('should return 200 when item PUT successfully', async () => {
    const pathParameters: Record<string, string> = { table: TEST_TABLE, id: EXPECTED1.id };
    const queryStringParameters: Record<string, string> = { keyName: 'id' };
    const requestContext: APIGatewayEventRequestContext = <APIGatewayEventRequestContext> { requestId: v4() };
    const body = JSON.stringify({ attr1: 'test-attr-1', attr2: 'test-attr-2' });
    const headers: Record<string, string> = {};
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> {
      pathParameters,
      queryStringParameters,
      requestContext,
      headers,
      body,
    };
    const contextMock: Context = <Context> { awsRequestId: v4() };

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    const item = await dynamoHelper.get({ id: <AttributeValue> EXPECTED1.id }, TEST_TABLE);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toStrictEqual(EXPECTED1);
    expect(item).toEqual(EXPECTED1);
  });

  test('should return 200 and only update specified attributes', async () => {
    const pathParameters: Record<string, string> = { table: TEST_TABLE, id: EXPECTED1.id };
    const queryStringParameters: Record<string, string> = { keyName: 'id' };
    const requestContext: APIGatewayEventRequestContext = <APIGatewayEventRequestContext> { requestId: v4() };
    const body = JSON.stringify({ attr2: 'test-attr-2-updated' });
    const headers: Record<string, string> = {};
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> {
      pathParameters,
      queryStringParameters,
      requestContext,
      headers,
      body,
    };
    const contextMock: Context = <Context> { awsRequestId: v4() };

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    const item = await dynamoHelper.get({ id: <AttributeValue> EXPECTED1.id }, TEST_TABLE);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toStrictEqual(
      { id: EXPECTED1.id, attr1: EXPECTED1.attr1, attr2: 'test-attr-2-updated' },
    );
    expect(item).toEqual({ id: EXPECTED1.id, attr1: EXPECTED1.attr1, attr2: 'test-attr-2-updated' });
  });

  test('should rethrow an error when table does not exist', async () => {
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

  test('should throw error when no keyName given', async () => {
    const pathParameters: Record<string, string> = { table: TEST_TABLE, id: EXPECTED1.id };
    const queryStringParameters: Record<string, string> = { };
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

    await expect(handler(eventMock, contextMock)).rejects.toThrow(
      'One of the required keys was not given a value',
    );
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
    await dynamoHelper.create(EXPECTED1, TEST_TABLE);
  });

  afterAll(async () => {
    const deleteParams = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);
  });
});
