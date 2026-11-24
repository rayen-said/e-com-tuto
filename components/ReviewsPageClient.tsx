'use client';

import SocialProofSection from './SocialProofSection';
import { useStore } from './StoreProvider';

export default function ReviewsPageClient() {
  const {
    refreshingView,
    verifyingOrderId,
    refreshMaterializedView,
    verifySignature,
    openLayerModal,
  } = useStore();

  return (
    <SocialProofSection
      refreshingView={refreshingView}
      verifyingOrderId={verifyingOrderId}
      onRefreshMaterializedView={() => void refreshMaterializedView()}
      onVerifySignature={(orderId, hash) => void verifySignature(orderId, hash)}
      onOpenLayerModal={openLayerModal}
    />
  );
}
