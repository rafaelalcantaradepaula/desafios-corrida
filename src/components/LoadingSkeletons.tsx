type CountProps = {
  count?: number;
};

export function ChallengeCardSkeleton({ count = 3 }: CountProps) {
  return (
    <div className="card-stack" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <article className={`challenge-card skeleton-card ${index === 0 ? "skeleton-card-featured" : ""}`} key={index}>
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line skeleton-line-body" />
          <div className="skeleton-row">
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-chip" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <section className="summary-card summary-card-compact skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line-kicker" />
      <div className="skeleton-line skeleton-line-title" />
      <div className="summary-strip">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="summary-pill skeleton-pill" key={index}>
            <div className="skeleton-line skeleton-line-label" />
            <div className="skeleton-line skeleton-line-body" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function RankingSkeleton({ count = 4 }: CountProps) {
  return (
    <div className="ranking-list" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <article className="ranking-row skeleton-card" key={index}>
          <div className="ranking-place skeleton-place" />
          <div className="ranking-copy">
            <div className="skeleton-line skeleton-line-body" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
          <div className="ranking-side skeleton-side">
            <div className="skeleton-line skeleton-line-chip" />
            <div className="skeleton-line skeleton-line-label" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function RosterSkeleton({ count = 4 }: CountProps) {
  return (
    <div className="roster-list" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <article className="roster-card skeleton-card" key={index}>
          <div className="roster-static-row">
            <div className="roster-copy">
              <div className="skeleton-line skeleton-line-body" />
              <div className="skeleton-line skeleton-line-short" />
            </div>
            <div className="skeleton-line skeleton-line-chip" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function DashboardSkeleton({ count = 2 }: CountProps) {
  return (
    <div className="dashboard-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <article className="surface-card skeleton-card" key={index}>
          <div className="skeleton-line skeleton-line-title" />
          <div className="admin-card-copy">
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-body" />
          </div>
          <div className="actions-row">
            <div className="skeleton-line skeleton-line-chip" />
          </div>
        </article>
      ))}
    </div>
  );
}
