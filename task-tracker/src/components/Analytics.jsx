export default function Analytics({ data }) {
  const { total, completed, percent } = data;

  return (
    <section className="analytics">
      <div className="analytics-card">
        <div className="label">Total Tasks</div>
        <div className="value">{total}</div>
      </div>
      <div className="analytics-card">
        <div className="label">Completed</div>
        <div className="value">{completed}</div>
      </div>
      <div className="analytics-card">
        <div className="label">Completion</div>
        <div className="value accent">{percent}%</div>
      </div>
    </section>
  );
}
