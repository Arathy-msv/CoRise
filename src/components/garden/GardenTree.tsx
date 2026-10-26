import { publicAsset } from "@/lib/public-asset";
import type { ProgressStage } from "@/lib/progress";

const STAGE_SRC: Record<ProgressStage, string> = {
  0: publicAsset("/images/garden/plant-sprout.png"),
  1: publicAsset("/images/garden/plant-sapling.png"),
  2: publicAsset("/images/garden/plant-blossom.png"),
  3: publicAsset("/images/garden/plant-fruit.png"),
  4: publicAsset("/images/garden/plant-fruit.png"),
};

/** Painted plant for the shared garden. Swaps artwork as pledges reach each growth stage. */
export function GardenTree({ stage, className = "" }: { stage: ProgressStage; className?: string }) {
  return (
    <div className={`relative h-full w-full ${className}`} data-plant-stage={stage}>
      <img
        key={STAGE_SRC[stage]}
        src={STAGE_SRC[stage]}
        alt=""
        className="gp-pop absolute inset-x-0 bottom-0 mx-auto h-[92%] w-auto max-w-full object-contain object-bottom"
      />
      {stage === 4 ? (
        <div className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2">
          <div className="garden-plaque-card rounded-md px-3 py-1.5 text-center text-[#fff6e4] shadow-md">
            <p className="text-sm font-extrabold leading-tight">❤️ Thank You!</p>
            <p className="text-[11px] font-semibold leading-tight">Our garden is alive</p>
            <p className="text-[11px] font-semibold leading-tight">because of you!</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
