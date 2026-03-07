interface OdsBadgeProps {
  number: number;
}

export function OdsBadge({ number }: OdsBadgeProps) {
  const bgColor = number === 13 ? 'bg-ods-13' : 'bg-ods-11';
  return (
    <span className={`${bgColor} text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full mr-1`}>
      ODS {number}
    </span>
  );
}

export function SubParameter({ text }: { text: string }) {
  const odsMatch = text.match(/^ODS(\d+)::(.*)/);
  if (odsMatch) {
    return (
      <span>
        <OdsBadge number={parseInt(odsMatch[1])} />
        {odsMatch[2]}
      </span>
    );
  }
  return <span>{text}</span>;
}
