import { describe, expect, it } from "vitest";
import { packetInput } from "../data/packet";
import { buildPacket } from "./packet";

describe("application packet builder", () => {
  it("blocks unsupported claims from the submission checklist", () => {
    const packet = buildPacket(packetInput);

    expect(packet.submission).toContainEqual(
      expect.objectContaining({
        label: "Unsupported claims excluded",
        status: "blocked"
      })
    );
    expect(packet.truthBoundary.unsupported).toBe(1);
  });

  it("separates verified facts from needs-proof facts for resume QA", () => {
    const packet = buildPacket(packetInput);

    expect(packet.resumeQa).toContainEqual(
      expect.objectContaining({
        label: expect.stringContaining("PMO coordination"),
        status: "review"
      })
    );
    expect(packet.resumeQa).toContainEqual(
      expect.objectContaining({
        label: expect.stringContaining("fixture-first workflow tools"),
        status: "ready"
      })
    );
  });

  it("adds an explicit synthetic-data boundary to the email preview", () => {
    const packet = buildPacket(packetInput);

    expect(packet.emailPreview).toContain("synthetic demo facts only");
    expect(packet.emailPreview).toContain("Verified claims highlighted");
  });
});
