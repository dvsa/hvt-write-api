import * as dynamodb from '../../../src/service/dynamodb.service';
import * as dynamoHelper from '../test-helpers/dynamo.helper';

const TEST_TABLE = 'TEST_TABLE_SERVICE';

describe('Test dynamodb service', () => {
  test('Put should put one item in the table', async () => {
    const expected = { id: 'test-id-1', attr1: 'test-attr-1' };
    await dynamodb.put(expected, TEST_TABLE);

    const result = await dynamoHelper.get({ id: expected.id }, TEST_TABLE);

    expect(result).toEqual(expected);
  });

  test('Delete should remove one item in the table', async () => {
    const expected1 = { id: 'test-id-1', attr1: 'test-attr-1' };
    const expected2 = { id: 'test-id-2', attr1: 'test-attr-2' };
    await dynamodb.put(expected1, TEST_TABLE);
    await dynamodb.put(expected2, TEST_TABLE);

    await dynamodb.remove({ id: expected1.id }, TEST_TABLE);
    const result = await dynamoHelper.getAll(TEST_TABLE);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expected2);
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
    const deleteParams: Record<string, unknown> = dynamoHelper.getDeleteTableParams(TEST_TABLE);
    await dynamoHelper.deleteTable(deleteParams);
  });
});
