import { AnimatePresence } from "motion/react";
import { ConstantStar } from "./StarGlyph";
import type { StoryPhase } from "./model";
import { storyStars } from "./titleConstellation";
import StoryStarChains from "./StoryStarChains";

export default function StoryStars({
  phase,
  reduced,
  activated,
  onReached,
}: {
  phase: StoryPhase;
  reduced: boolean;
  activated: boolean;
  onReached: (starId: string) => void;
}) {
  return (
    <>
      <StoryStarChains
        phase={phase}
        reduced={reduced}
        activated={activated}
        onReached={onReached}
      />
      <div className="story-star-plane" aria-hidden="true" data-phase={phase}>
        <AnimatePresence>
          {storyStars
            .filter((star) => star.layer <= phase)
            .map((star) => (
              <ConstantStar key={star.starId} {...star} reduced={reduced} />
            ))}
        </AnimatePresence>
      </div>
    </>
  );
}
