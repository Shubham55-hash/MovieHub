// Utility to extract generic error messages from API responses or exceptions
export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const resp = (error as { response?: { data?: { status_message?: string } } }).response;
    if (resp?.data?.status_message) return resp.data.status_message;
  }
  return 'An unexpected error occurred';
};
