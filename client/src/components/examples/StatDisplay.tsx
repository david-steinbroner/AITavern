import StatDisplay from '../StatDisplay';

export default function StatDisplayExample() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <StatDisplay label="STR" value={16} />
      <StatDisplay label="DEX" value={14} />
      <StatDisplay label="CON" value={13} />
    </div>
  );
}