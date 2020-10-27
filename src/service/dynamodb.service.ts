import { DynamoDB } from 'aws-sdk';
import type { AttributeValue } from 'aws-lambda';
import {
  DeleteItemOutput, Key, PutItemOutput, UpdateItemInput, UpdateItemOutput,
} from 'aws-sdk/clients/dynamodb';
import { getConfig, Config } from '../lib/config';

const config: Config = getConfig();

export const client = new DynamoDB.DocumentClient({
  endpoint: config.DYNAMO_URL,
  region: config.DYNAMO_REGION,
});

const getUpdateParams = (
  keyName: string, keyValue: AttributeValue, data: Record<string, unknown>, table: string,
): UpdateItemInput => {
  const updateExpressionKeys: string[] = [];
  const expressionAttributeNames: Record<string, string> = { [`#${keyName}`]: `${keyName}` };
  const expressionAttributeValues: Record<string, unknown> = { [`:${keyName}`]: keyValue };

  Object.keys(data).forEach((k) => {
    updateExpressionKeys.push(`#${k} = :${k}`);
    expressionAttributeNames[`#${k}`] = `${k}`;
    expressionAttributeValues[`:${k}`] = data[`${k}`];
  });

  const updateExpression = `SET ${updateExpressionKeys.join(', ')}`;
  return {
    TableName: table,
    Key: { [keyName]: keyValue },
    UpdateExpression: updateExpression,
    ConditionExpression: `#${keyName} = :${keyName}`,
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

export const update = async (
  keyName: string, keyValue: AttributeValue, data: Record<string, unknown>, table: string,
): Promise<UpdateItemOutput> => {
  const params = getUpdateParams(keyName, keyValue, data, table);

  return client.update(params).promise();
};
