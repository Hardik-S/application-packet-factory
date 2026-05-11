import { packetInput } from "../data/packet";
import { buildPacket } from "../lib/packet";

const statusLabels = {
  ready: "Ready",
  review: "Review",
  blocked: "Blocked"
};

export default function Home() {
  const packet = buildPacket(packetInput);

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
          <span>Boundary</span>
          <strong>Synthetic data only</strong>
          <p>Real personal facts, resumes, and employer data are intentionally excluded from this public slice.</p>
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
            <article className="check" key={item.label}>
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
    </main>
  );
}
