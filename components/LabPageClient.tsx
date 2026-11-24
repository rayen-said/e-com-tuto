'use client';

import TelemetryLab from './TelemetryLab';
import { useStore } from './StoreProvider';

export default function LabPageClient() {
  const {
    kpis,
    p99Latency,
    kpiFlashKey,
    inspectingKpis,
    activeTab,
    logs,
    selectedLogId,
    animSeed,
    inspectKpis,
    setActiveTab,
    setSelectedLogId,
    clearLogs,
    replayAnimation,
    openLayerModal,
  } = useStore();

  return (
    <TelemetryLab
      kpis={kpis}
      p99Latency={p99Latency}
      kpiFlashKey={kpiFlashKey}
      inspectingKpis={inspectingKpis}
      activeTab={activeTab}
      logs={logs}
      selectedLogId={selectedLogId}
      animSeed={animSeed}
      onInspectKpis={() => void inspectKpis()}
      onSwitchTab={setActiveTab}
      onSelectLog={setSelectedLogId}
      onClearLogs={clearLogs}
      onReplayAnimation={replayAnimation}
      onOpenLayerModal={openLayerModal}
    />
  );
}
