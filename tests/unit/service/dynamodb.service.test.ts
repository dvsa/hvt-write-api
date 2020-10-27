/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Key } from 'aws-sdk/clients/dynamodb';
import type { AttributeValue } from 'aws-lambda';
import * as dynamoDbService from '../../../src/service/dynamodb.service';

jest.mock('../../../src/lib/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    NODE_ENV: 'development',
    DYNAMO_URL: 'some-url',
    DYNAMO_REGION: 'eu-west-2',
  }),
}));

const TEST_TABLE = 'TEST_TABLE_SERVICE';
const EXPECTED1 = { id: '1', attr1: 'test-attr-1', attr2: 'test-attr-2' };
const PROMISE_RESULT = 'PROMISE RESULT';

const promiseMock = jest.fn().mockImplementation(() => new Promise((resolve) => resolve(PROMISE_RESULT)));

describe('Dynamodb service tests', () => {
  it('should construct PUT PARAMS OBJECT and call PUT on dynamo client', async () => {
    const putMock = jest.fn().mockImplementation(() => ({
      promise: promiseMock,
    }));
    dynamoDbService.client.put = putMock.bind(dynamoDbService.client);
    const expectedCallParams = {
      Item: EXPECTED1,
      TableName: TEST_TABLE,
    };

    const response = await dynamoDbService.create(EXPECTED1, TEST_TABLE);

    expect(putMock).toHaveBeenCalledWith(expectedCallParams);
    expect(promiseMock).toHaveBeenCalled();
    expect(response).toBe(PROMISE_RESULT);
  });

  it('should construct UPDATE PARAMS OBJECT and call UPDATE on dynamo client', async () => {
    const updateMock = jest.fn().mockImplementation(() => ({
      promise: promiseMock,
    }));
    dynamoDbService.client.update = updateMock.bind(dynamoDbService.client);
    const expectedCallParams = {
      ConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#attr1': 'attr1',
        '#attr2': 'attr2',
        '#id': 'id',
      },
      ExpressionAttributeValues: {
        ':attr1': EXPECTED1.attr1,
        ':attr2': EXPECTED1.attr2,
        ':id': EXPECTED1.id,
      },
      Key: {
        id: '1',
      },
      ReturnValues: 'ALL_NEW',
      TableName: TEST_TABLE,
      UpdateExpression: 'SET #id = :id, #attr1 = :attr1, #attr2 = :attr2',
    };

    const response = await dynamoDbService.update('id', <AttributeValue> EXPECTED1.id, EXPECTED1, TEST_TABLE);

    expect(updateMock).toHaveBeenCalledWith(expectedCallParams);
    expect(promiseMock).toHaveBeenCalled();
    expect(response).toBe(PROMISE_RESULT);
  });
});
