import fs from "fs/promises";
import path from "path";
import { z } from "zod";

// Limit the rate at which a function be called to, for example, limit API requests to 1 per second
export const rateLimit = <T extends Array<unknown>, U>(fn: (...args: T) => Promise<U>) => {
  let lastCalledMs = 0;

  return async (...args: T): Promise<U> => {
    while (Date.now() - lastCalledMs < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - (Date.now() - lastCalledMs)));
    }

    lastCalledMs = Date.now();

    return fn(...args);
  };
};

export const ensureDirectoriesExist = async (dirPath: string) => {
  try {
    await fs.access(dirPath, fs.constants.F_OK);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};
