import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../../src/handler/patch';
import * as dynamoDbService from '../../../src/service/dynamodb.service';
import * as logger from '../../../src/util/logger';

jest.mock('../../../src/util/logger');
jest.mock('../../../src/service/dynamodb.service');
jest.mock('../../../src/lib/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    NODE_ENV: 'development',
    DYNAMO_URL: 'some-url',
    DYNAMO_REGION: 'eu-west-1',
  }),
}));

const loggerInfoSpy = jest.fn();
const loggerErrSpy = jest.fn();

const { createLogger } = logger as jest.Mocked<typeof logger>;
const { update } = dynamoDbService as jest.Mocked<typeof dynamoDbService>;

const context = { awsRequestId: 'dummy-aws-request-id' } as unknown as Context;
const event = {
  pathParameters: {
    table: 'dummy-table',
    id: 'dummy-id',
  },
  queryStringParameters: {
    keyName: 'dummy-keyName',
  },
  body: '{"attr-1": "dummy-body"}',
} as unknown as APIGatewayProxyEvent;
const eventWithoutKeyName = {
  pathParameters: {
    table: 'dummy-table',
    id: 'dummy-id',
  },
  queryStringParameters: {
  },
  body: '{"attr-1": "dummy-body"}',
} as unknown as APIGatewayProxyEvent;

describe('PATCH handler', () => {
  it('should return 200 when dyanmodb service returns object', async () => {
    update.mockImplementation(jest.fn().mockResolvedValue('{"attr-1": "dummy-body"}'));

    const result = await handler(event, context);

    expect(result.statusCode).toEqual(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      'dummy-keyName', 'dummy-id', { 'attr-1': 'dummy-body' }, 'dummy-table',
    );
    expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
    expect(loggerInfoSpy.mock.calls[0]).toEqual(
      // eslint-disable-next-line max-len
      ['Put: {"pathParams":{"table":"dummy-table","id":"dummy-id"},"keyName":"dummy-keyName","data":{"attr-1":"dummy-body"}}'],
    );
  });

  it('should use default keyName param when none provided', async () => {
    update.mockImplementation(jest.fn().mockResolvedValue('{"attr-1": "dummy-body"}'));

    const result = await handler(eventWithoutKeyName, context);

    expect(result.statusCode).toEqual(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      'id', 'dummy-id', { 'attr-1': 'dummy-body' }, 'dummy-table',
    );
    expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
    expect(loggerInfoSpy.mock.calls[0]).toEqual(
      // eslint-disable-next-line max-len
      ['Put: {"pathParams":{"table":"dummy-table","id":"dummy-id"},"keyName":"id","data":{"attr-1":"dummy-body"}}'],
    );
  });

  it('should rethrow and log an error when dynamodb service fails', async () => {
    update.mockImplementation(() => { throw new Error('Error Message'); });

    await expect(handler(event, context)).rejects.toThrow('Error Message');

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('dummy-keyName', 'dummy-id', { 'attr-1': 'dummy-body' }, 'dummy-table');
    expect(loggerErrSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrSpy.mock.calls[0]).toEqual([new Error('Error Message')]);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    createLogger.mockImplementation(jest.fn().mockReturnValue({
      info: loggerInfoSpy,
      error: loggerErrSpy,
    }));
  });
});
