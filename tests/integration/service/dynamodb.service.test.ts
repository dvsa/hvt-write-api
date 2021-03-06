import type { AttributeValue } from 'aws-lambda';
import * as dynamodb from '../../../src/service/dynamodb.service';
import * as dynamoHelper from '../test-helpers/dynamo.helper';

const TEST_TABLE = 'TEST_TABLE_SERVICE';

describe('Test dynamodb service', () => {
  test('Create should add one item in the table', async () => {
    const expected = { id: '1', attr1: 'test-attr-1' };

    await dynamodb.create(expected, TEST_TABLE);

    const result = await dynamoHelper.get({ id: <AttributeValue> expected.id }, TEST_TABLE);
    expect(result).toEqual(expected);
  });

  test('Update should update one item in the table', async () => {
    const original = { id: '1', attr1: 'test-attr-1' };
    const other = { id: '2', attr1: 'test-attr-1' };
    await dynamoHelper.create(original, TEST_TABLE);
    await dynamoHelper.create(other, TEST_TABLE);

    await dynamodb.update('id', <AttributeValue> '1', { attr1: 'test-attr-1-updated' }, TEST_TABLE);

    const expectedResult = await dynamoHelper.get({ id: <AttributeValue> original.id }, TEST_TABLE);
    const otherResult = await dynamoHelper.get({ id: <AttributeValue> other.id }, TEST_TABLE);
    expect(expectedResult).toEqual({ id: original.id, attr1: 'test-attr-1-updated' });
    expect(otherResult).toEqual(other);
  });

  test('Update should update only specified attribute of item in the table', async () => {
    const original = { id: '1', attr1: 'test-attr-1', attr2: 'test-attr-2' };
    await dynamoHelper.create(original, TEST_TABLE);

    await dynamodb.update('id', <AttributeValue> '1', { attr2: 'test-attr-2-updated' }, TEST_TABLE);

    const result = await dynamoHelper.get({ id: <AttributeValue> original.id }, TEST_TABLE);
    expect(result).toEqual({ id: original.id, attr1: 'test-attr-1', attr2: 'test-attr-2-updated' });
  });

  test('Update should update all attributes of item in the table', async () => {
    const original = { id: '1', attr1: 'test-attr-1', attr2: 'test-attr-2' };
    await dynamoHelper.create(original, TEST_TABLE);

    await dynamodb.update(
      'id',
      <AttributeValue> '1',
      { attr1: 'test-attr-1-updated', attr2: 'test-attr-2-updated' },
      TEST_TABLE,
    );

    const result = await dynamoHelper.get({ id: <AttributeValue> original.id }, TEST_TABLE);
    expect(result).toEqual({ id: original.id, attr1: 'test-attr-1-updated', attr2: 'test-attr-2-updated' });
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
