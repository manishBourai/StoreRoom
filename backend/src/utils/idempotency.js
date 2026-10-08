import {
  IdempotencyInProgressError,
  MissingIdempotencyKeyError,
} from "./signup.errors";

// export interface RedisIdempotencyClient {
//   set(
//     key: string,
//     value: string,
//     options: {
//       NX: boolean;
//       EX: number;
//     }
//   ): Promise<string | null>;

//   get(key: string): Promise<string | null>;

//   del(key: string): Promise<number>;
// }



const IDEMPOTENCY_TTL = 60 * 10;

export function getIdempotencyKey(value)
  {
  if (!value) {
    throw new MissingIdempotencyKeyError();
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function acquireIdempotencyKey(
  redis,
  idempotencyKey
){
  const redisKey = `signup:idempotency:${idempotencyKey}`;

  const processingState = {
    status: "processing",
  };

  const result = await redis.set(
    redisKey,
    JSON.stringify(processingState),
    {
      NX: true,
      EX: IDEMPOTENCY_TTL,
    }
  );

  if (result === "OK") {
    return {
      type: "acquired",
    };
  }

  const existingValue = await redis.get(redisKey);

  if (!existingValue) {
    return acquireIdempotencyKey(
      redis,
      idempotencyKey
    );
  }

  const existingState = JSON.parse(existingValue) 

  if (existingState.status === "processing") {
    throw new IdempotencyInProgressError();
  }

  return {
    type: "completed",
    response: existingState.response,
  };
}

export async function completeIdempotencyKey(
  redis,
  idempotencyKey,
  response
) {
  const redisKey = `signup:idempotency:${idempotencyKey}`;

  const completedState = {
    status: "completed",
    response,
  };

  await redis.set(
    redisKey,
    JSON.stringify(completedState),
    {
      NX: false,
      EX: IDEMPOTENCY_TTL,
    }
  );
}

export async function releaseIdempotencyKey(
  redis,
  idempotencyKey
) {
  const redisKey = `signup:idempotency:${idempotencyKey}`;

  await redis.del(redisKey);
}