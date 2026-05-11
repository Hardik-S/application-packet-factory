import { packetInput } from "../data/packet";
import { buildPacket, buildReviewPlan, createSubmissionPacket } from "../lib/packet";

const statusLabels = {
  ready: "Ready",
  review: "Review",
  blocked: "Blocked",
  verified: "Verified"
};

export default function Home() {
  const packet = buildPacket(packetInput);
  const reviewPlan = buildReviewPlan(packetInput, packet);
  const reviewPacket = createSubmissionPacket(packetInput, packet, reviewPlan);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Synthetic career operations workflow</p>
          <h1>Application Packet Factory</h1>
          <p className="lede">
            A fixture-backed packet QA surface that turns a synthetic role brief and candidate facts
            into a submission checklist, resume review queue, and email draft preview with truth
            boundaries visible before anything is sent.
          </p>
        </div>
        <div className="boundary">
          <span>Send state</span>
          <strong>{statusLabels[reviewPlan.sendState]}</strong>
          <p>{reviewPlan.reviewerSummary}</p>
          <small>Synthetic data only. No email was sent.</small>
        </div>
      </section>

      <section className="summary" aria-label="Truth boundary summary">
        <article>
          <span>Verified facts</span>
          <strong>{packet.truthBoundary.verified}</strong>
        </article>
        <article>
          <span>Needs proof</span>
          <strong>{packet.truthBoundary.needsProof}</strong>
        </article>
        <article>
          <span>Unsupported</span>
          <strong>{packet.truthBoundary.unsupported}</strong>
        </article>
        <article>
          <span>Deadline</span>
          <strong>{packetInput.role.deadline}</strong>
        </article>
      </section>

      <section className="reviewDesk" aria-label="Reviewer action desk">
        <div className="deskHeader">
          <div>
            <p className="eyebrow">Reviewer queue</p>
            <h2>Human approval gate before submission</h2>
          </div>
          <span className={`status ${reviewPlan.sendState}`}>{statusLabels[reviewPlan.sendState]}</span>
        </div>
        <div className="actionGrid">
          {reviewPlan.actions.map((action) => (
            <article className="action" key={action.label}>
              <span className={`status ${action.status}`}>{statusLabels[action.status]}</span>
              <div>
                <h3>{action.label}</h3>
                <p>{action.rationale}</p>
                <small>{action.owner}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rolePanel" aria-label="Role and source context">
        <div>
          <p className="eyebrow">Role target</p>
          <h2>
            {packetInput.role.title} at {packetInput.role.company}
          </h2>
          <p>{packet.truthBoundary.guidance}</p>
        </div>
        <div className="sources">
          <span>Role source: {packetInput.role.source}</span>
          <span>Fact source: {packetInput.candidate.source}</span>
        </div>
      </section>

      <section className="coverage" aria-label="Requirement coverage">
        <div>
          <p className="eyebrow">Requirement coverage</p>
          <h2>Role-fit map with proof state</h2>
        </div>
        {reviewPlan.requirementCoverage.map((coverage) => (
          <article className="coverageRow" key={coverage.requirement}>
            <span className={`status ${coverage.status}`}>{statusLabels[coverage.status]}</span>
            <div>
              <h3>{coverage.requirement}</h3>
              <p>{coverage.rationale}</p>
              {coverage.facts.length > 0 ? (
                <small>{coverage.facts.map((fact) => `${fact.id}: ${fact.evidence}`).join(" | ")}</small>
              ) : (
                <small>No claim should be used for this requirement yet.</small>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="grid" aria-label="Packet checklists">
        <div className="panel">
          <h2>Submission checklist</h2>
          {packet.submission.map((item) => (
            <article className="check" key={item.label}>
              <span className={`status ${item.status}`}>{statusLabels[item.status]}</span>
              <div>
                <h3>{item.label}</h3>
                <p>{item.rationale}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="panel">
          <h2>Resume QA checklist</h2>
          {packet.resumeQa.map((item) => (
            <article className="check" key={item.sourceId ?? item.label}>
              <span className={`status ${item.status}`}>{statusLabels[item.status]}</span>
              <div>
                <h3>{item.label}</h3>
                <p>{item.rationale}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="email" aria-label="Email draft preview">
        <div>
          <p className="eyebrow">Draft preview</p>
          <h2>{packetInput.draftEmail.subject}</h2>
          <span>To: {packetInput.draftEmail.to}</span>
        </div>
        <pre>{packet.emailPreview}</pre>
      </section>

      <section className="email" aria-label="Review packet preview">
        <div>
          <p className="eyebrow">Review packet</p>
          <h2>Copy-safe Markdown artifact</h2>
          <span>Unsupported claims are counted, not copied into the final packet.</span>
        </div>
        <pre>{reviewPacket}</pre>
      </section>
    </main>
  );
}
