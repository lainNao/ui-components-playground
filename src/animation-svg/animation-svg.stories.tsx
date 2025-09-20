import { useState } from "react";
import { FavoriteParticle } from "./favorite-particle";
import { Flow } from "./flow";
import { Spin } from "./spin";

export default {};

export const SpinAnimation = () => <Spin />;

export const FlowAnimation = () => <Flow />;

export const FavoriteParticleBurst = () => {
  const [isLiked, setIsLiked] = useState(false);
  return <FavoriteParticle isLiked={isLiked} onToggle={setIsLiked} />;
};
