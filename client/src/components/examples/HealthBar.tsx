import HealthBar from '../HealthBar';

export default function HealthBarExample() {
  return (
    <div className="space-y-4 p-4 max-w-sm">
      <HealthBar current={75} max={100} type="health" />
      <HealthBar current={30} max={50} type="mana" />
    </div>
  );
}