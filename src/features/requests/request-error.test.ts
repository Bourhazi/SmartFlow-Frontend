import { describe, expect, it } from "vitest";
import { getRequestActionError } from "./request-error";

describe("getRequestActionError", () => {
  it("returns a refresh message for an optimistic concurrency conflict", () => {
    expect(getRequestActionError({ response: { status: 409 } })).toBe(
      "This request was changed by another user. Refresh and try again.",
    );
  });

  it("returns a default message for other failures", () => {
    expect(getRequestActionError({ response: { status: 400 } })).toBe(
      "Unable to complete this action. Please try again.",
    );
  });
});