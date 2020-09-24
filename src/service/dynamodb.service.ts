import { DynamoDB } from 'aws-sdk';
import {
  DeleteItemOutput, PutItemOutput,
} from 'aws-sdk/clients/dynamodb';

type DynamoKey = {[key: string]: string};

const client = new DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMO_URL,
  region: process.env.DYNAMO_REGION,
});

export const put = async <T>(item: T, table: string): Promise<PutItemOutput> => {
  const params = {
    Item: item,
    TableName: table,
  };

  const res = await client.put(params).promise();
  return res;
};

export const remove = async (key: DynamoKey, table: string): Promise<DeleteItemOutput> => {
  const params = {
    Key: key,
    TableName: table,
  };

  const res = await client.delete(params).promise();
  return res;
};
