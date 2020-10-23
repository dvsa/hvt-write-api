import 'dotenv/config';

export interface Config {
  NODE_ENV: string
  DYNAMO_URL: string
  DYNAMO_REGION: string
}

export const getConfig = (): Config => {
  [
    'NODE_ENV',
    'DYNAMO_URL',
    'DYNAMO_REGION',
  ].forEach((envVar) => {
    if (!process.env[`${envVar}`]) {
      throw new Error(`Environment variable ${envVar} seems to be missing.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    DYNAMO_URL: process.env.DYNAMO_URL,
    DYNAMO_REGION: process.env.DYNAMO_REGION,
  };
};
