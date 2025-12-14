
const BrainMetricsOverlay = ({ data  }: any) => {
  if (!data) return null;

  // Map metrics to brain areas (based on cognitive neuroscience conventions)
  const regions = [
    {
      label: "Prefrontal Cortex (Decision / Focus)",
      value: data.decisionConfidence,
      style: { top: "18%", left: "22%" },
    },
    {
      label: "Attention & Focus",
      value: data.attention,
      style: { top: "30%", left: "35%" },
    },
    {
      label: "Cognitive Load",
      value: data.cognitiveLoad,
      style: { top: "42%", left: "48%" },
    },
    {
      label: "Memory (Hippocampus)",
      value: data.memory,
      style: { top: "55%", left: "58%" },
    },
    {
      label: "Processing Speed",
      value: data.speed,
      style: { top: "35%", left: "60%" },
    },
    {
      label: "Fatigue Index",
      value: data.fatigueIndex,
      style: { top: "65%", left: "40%" },
    },
    {
      label: "Flexibility",
      value: data.flexibility,
      style: { top: "28%", left: "50%" },
    },
    {
      label: "Behavior Drift",
      value: data.behaviorDrift,
      style: { top: "48%", left: "25%" },
    },
  ];

  const getColor = (value: any) => {
    if (value >= 0.75) return "bg-green-500";
    if (value >= 0.5) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <img
        src="/brain.png"
        alt="Brain"
        className="w-full h-auto"
      />

      {regions.map((region, idx) => (
        <div
          key={idx}
          className={`absolute text-xs text-white px-2 py-1 rounded shadow-lg ${getColor(
            region.value
          )}`}
          style={region.style}
        >
          <div className="font-semibold">{region.label}</div>
          <div>{(region.value * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
};

export default BrainMetricsOverlay;
