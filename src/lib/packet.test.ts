import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { packetInput } from "../data/packet";
import { buildArtifactMetadata, buildPacket, buildReviewPlan, createSubmissionPacket } from "./packet";

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

  it("prioritizes reviewer actions when unsupported claims or proof gaps exist", () => {
    const packet = buildPacket(packetInput);
    const reviewPlan = buildReviewPlan(packetInput, packet);

    expect(reviewPlan.sendState).toBe("blocked");
    expect(reviewPlan.actions[0]).toMatchObject({
      label: "Remove unsupported claims",
      status: "blocked"
    });
    expect(reviewPlan.actions).toContainEqual(
      expect.objectContaining({
        label: "Attach proof for review claims",
        status: "review"
      })
    );
    expect(reviewPlan.actions).toContainEqual(
      expect.objectContaining({
        label: "Send only the verified packet",
        status: "blocked"
      })
    );
  });

  it("maps every role requirement to verified, review, or gap evidence", () => {
    const packet = buildPacket(packetInput);
    const reviewPlan = buildReviewPlan(packetInput, packet);

    expect(reviewPlan.requirementCoverage).toHaveLength(packetInput.role.requirements.length);
    expect(reviewPlan.requirementCoverage).toContainEqual(
      expect.objectContaining({
        requirement: expect.stringContaining("AI-assisted workflow boundaries"),
        status: "verified",
        facts: expect.arrayContaining([expect.objectContaining({ id: "fact-ai" })])
      })
    );
    expect(reviewPlan.requirementCoverage).toContainEqual(
      expect.objectContaining({
        requirement: expect.stringContaining("PMO-style follow-up"),
        status: "review",
        facts: expect.arrayContaining([expect.objectContaining({ id: "fact-pmo" })])
      })
    );
  });

  it("creates a reviewer packet without unsupported claims", () => {
    const packet = buildPacket(packetInput);
    const reviewPlan = buildReviewPlan(packetInput, packet);
    const markdown = createSubmissionPacket(packetInput, packet, reviewPlan);

    expect(markdown).toContain("# Application Packet Factory review packet");
    expect(markdown).toContain("Send state: blocked");
    expect(markdown).toContain("Built fixture-first workflow tools");
    expect(markdown).toContain("Needs proof: Can support PMO coordination");
    expect(markdown).toContain("Blocked unsupported claims: 1");
    expect(markdown).not.toContain("Advanced Salesforce administrator");
  });

  it("requires every role requirement to have verified support before evidence is ready", () => {
    const packet = buildPacket(packetInput);

    expect(packet.submission).toContainEqual(
      expect.objectContaining({
        label: "Verified evidence mapped",
        status: "review",
        rationale: expect.stringContaining("3 of 4 requirement(s)")
      })
    );
  });

  it("does not infer requirement support from loose keyword overlap", () => {
    const inputWithoutExplicitSupport = {
      ...packetInput,
      role: {
        ...packetInput.role,
        requirements: ["workflow tools"]
      },
      candidate: {
        ...packetInput.candidate,
        facts: [
          {
            id: "fact-keyword-only",
            claim: "Built workflow tools for operations review.",
            evidence: "Synthetic note says this exists.",
            trust: "verified" as const
          }
        ]
      }
    };

    const packet = buildPacket(inputWithoutExplicitSupport);
    const reviewPlan = buildReviewPlan(inputWithoutExplicitSupport, packet);

    expect(reviewPlan.requirementCoverage[0]).toMatchObject({
      status: "blocked",
      facts: []
    });
  });

  it("keeps the committed reviewer packet artifact in sync with the generator", () => {
    const packet = buildPacket(packetInput);
    const reviewPlan = buildReviewPlan(packetInput, packet);
    const markdown = createSubmissionPacket(packetInput, packet, reviewPlan);
    const committedArtifact = readFileSync(resolve(process.cwd(), "docs/review-packet.example.md"), "utf8")
      .replace(/\r\n/g, "\n")
      .trim();

    expect(markdown).toBe(committedArtifact);
  });

  it("summarizes packet artifact metadata for local-only copy and download actions", () => {
    const packet = buildPacket(packetInput);
    const reviewPlan = buildReviewPlan(packetInput, packet);
    const markdown = createSubmissionPacket(packetInput, packet, reviewPlan);
    const metadata = buildArtifactMetadata(markdown, reviewPlan);

    expect(metadata).toMatchObject({
      filename: "application-packet-factory-review-packet.md",
      status: "blocked",
      guidance: expect.stringContaining("Do not send")
    });
    expect(metadata.byteSize).toBeGreaterThan(500);
  });
});
