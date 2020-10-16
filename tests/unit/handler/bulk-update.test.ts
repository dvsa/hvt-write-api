import type { APIGatewayProxyEvent, Context } from 'aws-lambda';

import * as logger from '../../../src/util/logger';
import * as bulkUpdate from '../../../src/lib/bulk-update';
import * as dynamoDbService from '../../../src/service/dynamodb.service';

import { handler } from '../../../src/handler/bulk-update';

jest.mock('../../../src/lib/bulk-update');
jest.mock('../../../src/service/dynamodb.service');
jest.mock('../../../src/util/logger');

const { parsePayload } = bulkUpdate as jest.Mocked<typeof bulkUpdate>;
const { update } = dynamoDbService as jest.Mocked<typeof dynamoDbService>;
const { createLogger } = logger as jest.Mocked<typeof logger>;

describe('bulk-update handler', () => {
  const context = { awsRequestId: 'dummy-aws-request-id' } as unknown as Context;
  const event = {
    pathParameters: {
      table: 'dummy-table',
    },
    body: 'dummy-body',
  } as unknown as APIGatewayProxyEvent;
  const loggerInfoSpy = jest.fn();
  const loggerWarnSpy = jest.fn();

  beforeEach(() => {
    createLogger.mockImplementation(jest.fn().mockReturnValue({
      info: loggerInfoSpy,
      warn: loggerWarnSpy,
    }));
  });

  afterEach(() => {
    createLogger.mockReset();
    loggerInfoSpy.mockReset();
    loggerWarnSpy.mockReset();
  });

  it('parses the request body', async () => {
    parsePayload.mockImplementation(jest.fn(() => []));
    update.mockImplementation(jest.fn().mockResolvedValue(undefined));

    await handler(event, context);

    expect(parsePayload).toHaveBeenCalledTimes(1);
    expect(parsePayload).toHaveBeenCalledWith(event.body);

    parsePayload.mockReset();
    update.mockReset();
  });

  it('reports that all records have been updated successfully', async () => {
    const payload = [
      { id: '1', update: { a: 'b' } },
      { id: '2', update: { c: 'd' } },
    ];
    parsePayload.mockImplementation(jest.fn(() => payload));
    update.mockImplementation(jest.fn().mockResolvedValue(undefined));

    const result = await handler(event, context);

    expect(result.statusCode).toEqual(200);
    expect(update).toHaveBeenCalledTimes(payload.length);
    payload.forEach((row, i) => {
      expect(update.mock.calls[i]).toEqual(['id', row.id, row.update, event.pathParameters.table]);
    });
    expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
    expect(loggerInfoSpy.mock.calls[0]).toEqual(['Bulk update: All records updated successfully.']);
    // eslint-disable-next-line max-len
    expect(loggerInfoSpy.mock.calls[1]).toEqual([`Bulk update: Items processed: ${payload.length}, updated: ${payload.length}, failed: 0.`]);
    expect(loggerWarnSpy).not.toHaveBeenCalled();

    parsePayload.mockReset();
    update.mockReset();
  });

  it('reports the records that could not be updated', async () => {
    const payload = [
      { id: '1', update: { a: 'b' } },
      { id: '2', update: { c: 'd' } },
      { id: '3', update: { foo: 'bar', baz: 'qux' } },
    ];
    const failed = ['2', '3'];
    parsePayload.mockImplementation(jest.fn(() => payload));
    // eslint-disable-next-line arrow-body-style
    update.mockImplementation(jest.fn().mockImplementation((_, id) => {
      return failed.includes(id) ? Promise.reject() : Promise.resolve();
    }));

    const result = await handler(event, context);

    expect(result.statusCode).toEqual(200);
    expect(update).toHaveBeenCalledTimes(payload.length);
    payload.forEach((row, i) => {
      expect(update.mock.calls[i]).toEqual(['id', row.id, row.update, event.pathParameters.table]);
    });
    expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line max-len
    expect(loggerWarnSpy).toHaveBeenCalledWith(`Bulk update: Could not update the following items: ${failed.join(', ')}`);
    expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line max-len
    expect(loggerInfoSpy).toHaveBeenCalledWith(`Bulk update: Items processed: ${payload.length}, updated: ${payload.length - failed.length}, failed: ${failed.length}.`);

    parsePayload.mockReset();
    update.mockReset();
  });
});
