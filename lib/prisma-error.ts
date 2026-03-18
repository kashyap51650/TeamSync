/* eslint-disable @typescript-eslint/no-explicit-any */

type PrismaErrorCode =
  | "P2002"
  | "P2025"
  | "P2003"
  | "P2014"
  | "P1001"
  | "P1008"
  | "P2016";

function isPrismaKnownError(error: unknown): error is {
  name: string;
  code: PrismaErrorCode;
  meta?: Record<string, unknown>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "name" in error &&
    (error as any).name === "PrismaClientKnownRequestError"
  );
}

function isPrismaValidationError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as any).name === "PrismaClientValidationError"
  );
}

export function handlePrismaError(error: unknown): {
  status: number;
  message: string;
  field?: string;
} {
  if (isPrismaKnownError(error)) {
    switch (error.code) {
      case "P2002": {
        const field = (error.meta?.target as string[])?.join(", ");
        return {
          status: 409,
          message: `${field ?? "Field"} already exists`,
          field,
        };
      }
      case "P2025":
        return { status: 404, message: "Record not found" };
      case "P2003":
        return { status: 400, message: "Related record does not exist" };
      case "P1001":
        return { status: 503, message: "Cannot reach database" };
      case "P1008":
        return { status: 504, message: "Database timeout" };
      default:
        return { status: 400, message: `Database error: ${error.code}` };
    }
  }

  if (isPrismaValidationError(error)) {
    return {
      status: 400,
      message: "Invalid query — check field names and types",
    };
  }

  throw error; // not a Prisma error, let it bubble
}
