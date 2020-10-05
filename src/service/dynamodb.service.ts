import { DynamoDB } from 'aws-sdk';
import {
  DeleteItemOutput, Key, PutItemOutput, UpdateItemInput, UpdateItemOutput,
} from 'aws-sdk/clients/dynamodb';

const client = new DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMO_URL,
  region: process.env.DYNAMO_REGION,
});

const getUpdateParams = (key: Key, data: Record<string, unknown>, table: string): UpdateItemInput => {
  const updateExpressionKeys: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  Object.keys(data).forEach((k) => {
    updateExpressionKeys.push(`#${k} = :${k}`);
    expressionAttributeNames[`#${k}`] = `${k}`;
    expressionAttributeValues[`:${k}`] = data[`${k}`];
  });

  const updateExpression = `SET ${updateExpressionKeys.join(', ')}`;

  return {
    TableName: table,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };
};

export const create = async <T> (item: T, table: string): Promise<PutItemOutput> => {
  const params = {
    Item: item,
    TableName: table,
  };

  return client.put(params).promise();
};

export const update = async (key: Key, data: Record<string, unknown>, table: string): Promise<UpdateItemOutput> => {
  const params = getUpdateParams(key, data, table);

  return client.update(params).promise();
};

export const remove = async (key: Key, table: string): Promise<DeleteItemOutput> => {
  const params = {
    Key: key,
    TableName: table,
  };

  return client.delete(params).promise();
};
