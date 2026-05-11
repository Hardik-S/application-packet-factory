export type FactTrust = "verified" | "needs-proof" | "unsupported";

export type CandidateFact = {
  id: string;
  claim: string;
  evidence: string;
  trust: FactTrust;
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

export function buildPacket(input: PacketInput): PacketOutput {
  const verifiedFacts = input.candidate.facts.filter((fact) => fact.trust === "verified");
  const needsProofFacts = input.candidate.facts.filter((fact) => fact.trust === "needs-proof");
  const unsupportedFacts = input.candidate.facts.filter((fact) => fact.trust === "unsupported");
  const matchedRequirements = input.role.requirements.filter((requirement) =>
    verifiedFacts.some((fact) => keywordOverlap(requirement, fact.claim) >= 2)
  );

  return {
    submission: [
      {
        label: "Role brief loaded",
        status: "ready",
        rationale: `${input.role.title} at ${input.role.company} is sourced from ${input.role.source}.`
      },
      {
        label: "Verified evidence mapped",
        status: matchedRequirements.length >= 2 ? "ready" : "review",
        rationale: `${matchedRequirements.length} requirement(s) have verified synthetic evidence.`
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

function buildEmailPreview(input: PacketInput, verifiedFacts: CandidateFact[]) {
  const proofLine = verifiedFacts
    .slice(0, 2)
    .map((fact) => fact.claim)
    .join(" ");

  return `${input.draftEmail.body}\n\nEvidence boundary: This packet uses synthetic demo facts only. Verified claims highlighted for this role: ${proofLine}`;
}

function keywordOverlap(left: string, right: string) {
  const rightWords = new Set(words(right));
  return words(left).filter((word) => rightWords.has(word)).length;
}

function words(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4);
}
