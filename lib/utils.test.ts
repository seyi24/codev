import { describe, expect, it } from "vitest";
import type { Document } from "@/lib/db/schema";
import {
  generateUUID,
  getDocumentTimestampByIndex,
  sanitizeText,
} from "@/lib/utils";

describe("sanitizeText", () => {
  it("removes the function call marker", () => {
    const input = "Hello <has_function_call> world";
    expect(sanitizeText(input)).toBe("Hello  world");
  });

  it("returns unchanged text when marker is absent", () => {
    expect(sanitizeText("plain text")).toBe("plain text");
  });
});

describe("generateUUID", () => {
  it("returns a valid UUID v4 string", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
    );
  });

  it("generates unique values", () => {
    const first = generateUUID();
    const second = generateUUID();
    expect(first).not.toBe(second);
  });
});

describe("getDocumentTimestampByIndex", () => {
  const createdAt = new Date("2024-06-15T10:00:00.000Z");

  const makeDocument = (): Document => ({
    id: "doc-1",
    createdAt,
    title: "Test",
    content: "Content",
    kind: "text",
    userId: "user-1",
  });

  it("returns the document timestamp for a valid index", () => {
    const documents = [makeDocument()];
    expect(getDocumentTimestampByIndex(documents, 0)).toBe(createdAt);
  });

  it("returns a new date when index is out of bounds", () => {
    const documents = [makeDocument()];
    const before = Date.now();
    const result = getDocumentTimestampByIndex(documents, 5);
    const after = Date.now();

    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it("returns a new date when documents is falsy", () => {
    const before = Date.now();
    const result = getDocumentTimestampByIndex(
      null as unknown as Document[],
      0,
    );
    const after = Date.now();

    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });
});
