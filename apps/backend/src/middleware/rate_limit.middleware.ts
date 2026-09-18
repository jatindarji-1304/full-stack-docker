import rateLimit from "express-rate-limit";

const createRateLimit = ({
  windowMs = 1 * 60 * 1000, // default it will take 1 min
  limit = 10, // default 10 requ for 1 min for same device.
  message = "Too Many requests from this device , please try again after some time.",
}) =>
  rateLimit({
    windowMs,
    limit,
    message,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

export const getRequestRateLimit = createRateLimit({
  limit: 50,
});

export const createRequestRateLimit = createRateLimit({
  limit: 10,
});

export const updateRequestRateLimit = createRateLimit({
  limit: 10,
});

export const deleteRequestRateLimit = createRateLimit({
  limit: 10,
});
