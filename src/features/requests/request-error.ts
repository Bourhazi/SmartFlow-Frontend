export function getRequestActionError(error: unknown): string {
  const status = (error as { response?: { status?: number } })
    .response?.status;

  if (status === 409) {
    return "This request was changed by another user. Refresh and try again.";
  }

  return "Unable to complete this action. Please try again.";
}