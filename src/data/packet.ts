import type { PacketInput } from "../lib/packet";

export const packetInput: PacketInput = {
  role: {
    title: "Product Operations Analyst",
    company: "Northstar Automation Labs",
    source: "synthetic-role-brief.md",
    deadline: "2026-05-17",
    requirements: [
      "Map ambiguous intake into repeatable operating checklists",
      "Explain AI-assisted workflow boundaries to non-technical reviewers",
      "Ship lightweight dashboards and QA notes under time pressure",
      "Coordinate PMO-style follow-up across founders, operators, and engineers"
    ]
  },
  candidate: {
    name: "Demo Candidate",
    source: "synthetic-master-facts.json",
    facts: [
      {
        id: "fact-ops",
        claim: "Built fixture-first workflow tools that convert messy source material into reviewable packets.",
        evidence: "Portfolio demos for intake review, ops follow-up, and evidence consoles.",
        trust: "verified"
      },
      {
        id: "fact-ai",
        claim: "Uses AI-assisted tooling while preserving human approval boundaries.",
        evidence: "Documented no-send and no-auto-submit product boundaries.",
        trust: "verified"
      },
      {
        id: "fact-pmo",
        claim: "Can support PMO coordination and stakeholder decision briefs.",
        evidence: "Mentioned in synthetic prep notes, but no project artifact is linked yet.",
        trust: "needs-proof"
      },
      {
        id: "fact-salesforce",
        claim: "Advanced Salesforce administrator.",
        evidence: "",
        trust: "unsupported"
      }
    ]
  },
  draftEmail: {
    to: "hiring-team@example.com",
    subject: "Application - Product Operations Analyst",
    body:
      "Hello Northstar team,\n\nI am applying for the Product Operations Analyst role. My work focuses on turning messy operational inputs into reviewable packets, with clear human approval boundaries around AI-assisted steps.\n\nI attached a concise resume and a short proof packet that maps the role requirements to verified project evidence.\n\nBest,\nDemo Candidate"
  }
};
