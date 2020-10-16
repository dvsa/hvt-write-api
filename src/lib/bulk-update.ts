import Joi from 'joi';

type BulkUpdatePayload = Array<{
  id: string,
  update: Record<string, unknown>,
}>;

/* eslint-disable */
const payloadSchema = Joi.array().items(Joi.object({
  id: Joi.string().guid().required(),
  update: Joi.object().required(),
}));
/* eslint-enable */

export const parsePayload = (requestBody: string): BulkUpdatePayload => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload = JSON.parse(requestBody);
  } catch {
    throw new Error('Unable to parse request body.');
  }

  const result = payloadSchema.validate(payload);
  if (result.error || result.errors) {
    throw new Error('Payload is invalid.');
  }

  return payload as BulkUpdatePayload;
};
