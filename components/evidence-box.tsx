 interface EvidenceBoxProps {
  evidence?: string[]
}

export function EvidenceBox({ evidence = [] }: EvidenceBoxProps) {
  return (
    <div className="mt-4 rounded-lg bg-[#111827] p-4 border-l-4 border-primary">
      <h5 className="text-sm font-semibold text-gray-400 mb-3">
        Evidence From Your Report
      </h5>
      <div className="space-y-2">
        {evidence.map((line, index) => (
          <p key={index} className="text-sm italic text-gray-300 pl-2">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}