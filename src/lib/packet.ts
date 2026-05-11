export type FactTrust = "verified" | "needs-proof" | "unsupported";

export type CandidateFact = {
  id: string;
  claim: string;
  evidence: string;
  trust: FactTrust;
  supportsRequirements?: string[];
};

export type PacketInput = {
  role: {
    title: string;
    company: string;
    source: string;
    deadline: string;
    requirements: string[];
  };
  candidate: {
    name: string;
    source: string;
    facts: CandidateFact[];
  };
  draftEmail: {
    to: string;
    subject: string;
    body: string;
  };
};

export type ChecklistItem = {
  label: string;
  status: "ready" | "review" | "blocked";
  rationale: string;
  sourceId?: string;
};

export type RequirementCoverage = {
  requirement: string;
  status: "verified" | "review" | "blocked";
  facts: CandidateFact[];
  rationale: string;
};

export type ReviewAction = ChecklistItem & {
  owner: string;
};

export type ReviewPlan = {
  sendState: ChecklistItem["status"];
  actions: ReviewAction[];
  requirementCoverage: RequirementCoverage[];
  reviewerSummary: string;
};

export type PacketOutput = {
  submission: ChecklistItem[];
  resumeQa: ChecklistItem[];
  emailPreview: string;
  truthBoundary: {
    verified: number;
    needsProof: number;
    unsupported: number;
    guidance: string;
  };
};

export type ArtifactMetadata = {
  filename: string;
  byteSize: number;
  status: ReviewPlan["sendState"];
  guidance: string;
};

export function buildPacket(input: PacketInput): PacketOutput {
  const verifiedFacts = input.candidate.facts.filter((fact) => fact.trust === "verified");
  const needsProofFacts = input.candidate.facts.filter((fact) => fact.trust === "needs-proof");
  const unsupportedFacts = input.candidate.facts.filter((fact) => fact.trust === "unsupported");
  const matchedRequirements = input.role.requirements.filter((requirement) =>
    verifiedFacts.some((fact) => supportsRequirement(fact, requirement))
  );
  const allRequirementsVerified = matchedRequirements.length === input.role.requirements.length;

  return {
    submission: [
      {
        label: "Role brief loaded",
        status: "ready",
        rationale: `${input.role.title} at ${input.role.company} is sourced from ${input.role.source}.`
      },
      {
        label: "Verified evidence mapped",
        status: allRequirementsVerified ? "ready" : "review",
        rationale: `${matchedRequirements.length} of ${input.role.requirements.length} requirement(s) have verified synthetic evidence.`
      },
      {
        label: "Unsupported claims excluded",
        status: unsupportedFacts.length === 0 ? "ready" : "blocked",
        rationale:
          unsupportedFacts.length === 0
            ? "No unsupported claims are present."
            : `${unsupportedFacts.length} unsupported claim(s) must be removed or proven before submission.`
      }
    ],
    resumeQa: input.candidate.facts.map((fact) => ({
      label: fact.claim,
      status: fact.trust === "verified" ? "ready" : fact.trust === "needs-proof" ? "review" : "blocked",
      sourceId: fact.id,
      rationale:
        fact.trust === "verified"
          ? `Can cite: ${fact.evidence}`
          : fact.trust === "needs-proof"
            ? `Needs artifact before strong resume wording: ${fact.evidence}`
            : "No evidence provided. Keep out of the packet."
    })),
    emailPreview: buildEmailPreview(input, verifiedFacts),
    truthBoundary: {
      verified: verifiedFacts.length,
      needsProof: needsProofFacts.length,
      unsupported: unsupportedFacts.length,
      guidance:
        "Use verified facts in final materials, soften needs-proof claims, and exclude unsupported claims until evidence exists."
    }
  };
}

export function buildReviewPlan(input: PacketInput, packet: PacketOutput): ReviewPlan {
  const requirementCoverage = input.role.requirements.map((requirement) => {
    const supportingFacts = input.candidate.facts.filter((fact) => supportsRequirement(fact, requirement));
    const verifiedFacts = supportingFacts.filter((fact) => fact.trust === "verified");
    const reviewFacts = supportingFacts.filter((fact) => fact.trust === "needs-proof");
    const status: RequirementCoverage["status"] =
      verifiedFacts.length > 0 ? "verified" : reviewFacts.length > 0 ? "review" : "blocked";

    return {
      requirement,
      status,
      facts: verifiedFacts.length > 0 ? verifiedFacts : reviewFacts,
      rationale:
        status === "verified"
          ? `Covered by ${verifiedFacts.length} verified fact(s).`
          : status === "review"
            ? `Has a plausible claim, but proof is required before strong wording.`
            : "No supported fact should be used for this requirement yet."
    };
  });

  const blockedActions = packet.submission.filter((item) => item.status === "blocked");
  const reviewActions = packet.resumeQa.filter((item) => item.status === "review");
  const gapCount = requirementCoverage.filter((item) => item.status === "blocked").length;
  const sendState: ChecklistItem["status"] =
    blockedActions.length > 0 || gapCount > 0 ? "blocked" : reviewActions.length > 0 ? "review" : "ready";

  const actions: ReviewAction[] = [
    ...(blockedActions.length > 0
      ? [
          {
            label: "Remove unsupported claims",
            status: "blocked" as const,
            owner: "Candidate reviewer",
            rationale: `${packet.truthBoundary.unsupported} unsupported claim(s) must stay out of the packet.`
          }
        ]
      : []),
    ...(reviewActions.length > 0
      ? [
          {
            label: "Attach proof for review claims",
            status: "review" as const,
            owner: "Candidate reviewer",
            rationale: `${packet.truthBoundary.needsProof} claim(s) need artifacts before strong wording.`
          }
        ]
      : []),
    {
      label: "Send only the verified packet",
      status: sendState === "ready" ? "ready" : sendState === "blocked" ? "blocked" : "review",
      owner: "Human sender",
      rationale:
        sendState === "ready"
          ? "Every claim is verified and every requirement has support."
          : "Send remains gated until blockers are removed and review claims are softened or proven."
    }
  ];

  return {
    sendState,
    actions,
    requirementCoverage,
    reviewerSummary:
      sendState === "blocked"
        ? "Blocked from sending until unsupported claims are removed and proof gaps are handled."
        : sendState === "review"
          ? "Review-ready, but not final-send-ready until proof-backed wording is confirmed."
          : "Ready for final human send after standard review."
  };
}

export function createSubmissionPacket(input: PacketInput, packet: PacketOutput, reviewPlan: ReviewPlan) {
  const verifiedFacts = input.candidate.facts.filter((fact) => fact.trust === "verified");
  const reviewFacts = input.candidate.facts.filter((fact) => fact.trust === "needs-proof");

  const lines = [
    "# Application Packet Factory review packet",
    "",
    `Role: ${input.role.title} at ${input.role.company}`,
    `Send state: ${reviewPlan.sendState}`,
    `Source boundary: ${input.role.source} plus ${input.candidate.source}; synthetic demo data only.`,
    "",
    "## Reviewer actions",
    ...reviewPlan.actions.map((action) => `- [${action.status}] ${action.label}: ${action.rationale}`),
    "",
    "## Verified claims",
    ...verifiedFacts.map((fact) => `- ${fact.claim} Evidence: ${fact.evidence}`),
    "",
    "## Needs proof",
    ...reviewFacts.map((fact) => `- Needs proof: ${fact.claim} Evidence to attach: ${fact.evidence}`),
    "",
    "## Requirement coverage",
    ...reviewPlan.requirementCoverage.map(
      (coverage) => `- [${coverage.status}] ${coverage.requirement}: ${coverage.rationale}`
    ),
    "",
    `Blocked unsupported claims: ${packet.truthBoundary.unsupported}`,
    "",
    "No email was sent. This packet is for human review only."
  ];

  return lines.join("\n");
}

export function buildArtifactMetadata(markdown: string, reviewPlan: ReviewPlan): ArtifactMetadata {
  return {
    filename: "application-packet-factory-review-packet.md",
    byteSize: Buffer.byteLength(markdown, "utf8"),
    status: reviewPlan.sendState,
    guidance:
      reviewPlan.sendState === "blocked"
        ? "Do not send this packet until blockers are removed; copy or download only for reviewer handoff."
        : reviewPlan.sendState === "review"
          ? "Use this packet for human review and proof attachment before the final send."
          : "Packet is ready for final human send after the sender completes standard review."
  };
}

function supportsRequirement(fact: CandidateFact, requirement: string) {
  return fact.supportsRequirements?.includes(requirement) ?? false;
}

function buildEmailPreview(input: PacketInput, verifiedFacts: CandidateFact[]) {
  const proofLine = verifiedFacts
    .slice(0, 2)
    .map((fact) => fact.claim)
    .join(" ");

  return `${input.draftEmail.body}\n\nEvidence boundary: This packet uses synthetic demo facts only. Verified claims highlighted for this role: ${proofLine}`;
}
