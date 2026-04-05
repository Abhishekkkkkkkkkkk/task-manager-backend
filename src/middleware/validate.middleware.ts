import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodIssue } from 'zod';
import { ParsedQs } from 'qs';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Fix 1: use .issues not .errors
      // Fix 2: explicitly type the issue parameter as ZodIssue
      const errors = result.error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Validation failed',
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      // Fix 3: same .issues fix for validateQuery
      const errors = result.error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Invalid query parameters',
        errors,
      });
      return;
    }

    // Fix 4: cast result.data to ParsedQs to satisfy Express's req.query type
    req.query = result.data as ParsedQs;
    next();
  };
};