import { useProductStore } from '../../stores/productStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { Card } from '../shared/Card';
import { Counter } from '../shared/Counter';

export function GelsSolidsSection() {
  const solids = useProductStore((s) => s.solids);
  const solidSelections = useFuelSelectionsStore((s) => s.solids);
  const setSolidPerHour = useFuelSelectionsStore((s) => s.setSolidPerHour);

  return (
    <Card title="Gels & Solids" icon="🍬">
      <div className="space-y-2">
        {solids.map((product) => {
          const sel = solidSelections.find((s) => s.productId === product.id);
          const perHour = sel?.perHour ?? 0;

          return (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">{product.carbsPerServing}g carbs</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    {product.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Counter
                  value={perHour}
                  onChange={(val) => setSolidPerHour(product.id, val)}
                  min={0}
                  max={5}
                  step={1}
                  suffix="/hr"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
