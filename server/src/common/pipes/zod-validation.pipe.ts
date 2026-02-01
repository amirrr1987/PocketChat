import {
  BadRequestException,
  PipeTransform,
  ArgumentMetadata,
  Injectable,
} from '@nestjs/common';

type ZodParseResult =
  | { success: true; data: unknown }
  | {
      success: false;
      error: {
        issues?: Array<{ path?: (string | number)[]; message?: string }>;
        errors?: unknown[];
      };
    };

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const metatype = metadata?.metatype as
      | { zodSchema?: { safeParse: (v: unknown) => unknown } }
      | undefined;
    const zodSchema = metatype?.zodSchema;
    if (!zodSchema) {
      return value;
    }
    const parseResult = zodSchema.safeParse(value) as ZodParseResult;
    if (parseResult.success) {
      return parseResult.data;
    }
    const error = parseResult.error;
    // Zod uses .issues (not .errors); support both for compatibility
    const issues =
      error.issues ?? (error as { errors?: unknown[] }).errors ?? [];
    const message = Array.isArray(issues)
      ? issues.map(
          (issue: { path?: (string | number)[]; message?: string }) => {
            const path =
              Array.isArray(issue.path) && issue.path.length > 0
                ? issue.path.join('.')
                : '(root)';
            return `${path}: ${issue.message ?? 'Invalid'}`;
          },
        )
      : ['Validation failed'];
    throw new BadRequestException(message);
  }
}
