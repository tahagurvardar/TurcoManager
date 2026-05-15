import { percent } from "../utils/format";

export default function ProgressBar({ label, value, max = 100, tone = "green" }) {
  return (
    <div className="meter">
      <div className="meter__label">
        <span>{label}</span>
        <strong>{Math.round(Number(value || 0))}</strong>
      </div>
      <div className="meter__track">
        <span className={`meter__fill meter__fill--${tone}`} style={{ width: `${percent(value, max)}%` }} />
      </div>
    </div>
  );
}
