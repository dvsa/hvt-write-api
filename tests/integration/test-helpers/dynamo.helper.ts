import { DynamoDB } from 'aws-sdk';
import { AttributeMap, PutItemOutput } from 'aws-sdk/clients/dynamodb';

type DynamoKey = {[key: string]: string};

type Item = AttributeMap;

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

export const get = async (key: DynamoKey, table: string): Promise<Item> => {
  const params = {
    Key: key,
    TableName: table,
  };

  const data = await DynamoClient.get(params).promise();

  return data.Item;
};

export const getAll = async (table: string): Promise<Item[]> => {
  const params = {
    TableName: table,
  };

  const response = await DynamoClient.scan(params).promise();

  return response.Items;
};

export const put = async <T>(item: T, table: string): Promise<PutItemOutput> => {
  const params = {
    Item: item,
    TableName: table,
  };

  const res = await DynamoClient.put(params).promise();
  return res;
};
