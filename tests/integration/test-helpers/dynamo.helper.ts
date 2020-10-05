import { DynamoDB } from 'aws-sdk';
import { GetItemOutput, Key, PutItemOutput } from 'aws-sdk/clients/dynamodb';

const rawDynamoClient = new DynamoDB({
  endpoint: process.env.DYNAMO_URL,
  region: process.env.DYNAMO_REGION,
});

const DynamoClient = new DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMO_URL,
  region: process.env.DYNAMO_REGION,
});

export const getDeleteTableParams = (tableName: string): Record<string, unknown> => {
  const params = {
    TableName: tableName,
  };

  return params;
};

export const getCreateTableParams = (keyName: string, tableName: string): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    AttributeDefinitions: [
      {
        AttributeName: keyName,
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    TableName: tableName,
  };

  return params;
};

export const createTable = async (params) => {
  await rawDynamoClient.createTable(params).promise();
};

export const deleteTable = async (params) => {
  await rawDynamoClient.deleteTable(params).promise();
};

export const get = async (key: Key, table: string): Promise<GetItemOutput> => {
  const params = {
    Key: key,
    TableName: table,
  };

  const data = await DynamoClient.get(params).promise();

  return data.Item;
};

export const getAll = async (table: string): Promise<GetItemOutput[]> => {
  const params = {
    TableName: table,
  };

  const response = await DynamoClient.scan(params).promise();

  return response.Items;
};

export const create = async <T> (item: T, table: string): Promise<PutItemOutput> => {
  const params = {
    Item: item,
    TableName: table,
  };

  return DynamoClient.put(params).promise();
};
