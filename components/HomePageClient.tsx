'use client';

import HeroSection from './HeroSection';
import { useStore } from './StoreProvider';

export default function HomePageClient() {
  const {
    ttfb,
    ssrPulseKey,
    replayingSsr,
    pingingNode,
    replaySSR,
    pingNode,
    openLayerModal,
  } = useStore();

  return (
    <HeroSection
      ttfb={ttfb}
      ssrPulseKey={ssrPulseKey}
      replayingSsr={replayingSsr}
      pingingNode={pingingNode}
      onReplaySSR={() => void replaySSR()}
      onPingNode={(node) => void pingNode(node)}
      onOpenLayerModal={openLayerModal}
    />
  );
}
