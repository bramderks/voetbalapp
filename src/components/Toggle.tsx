"use client";

interface ToggleProps {
  value: boolean | null; // true = aanwezig, false = afwezig, null = geen status
  onChange: (val: boolean | null) => void;
}

export default function Toggle({ value, onChange }: ToggleProps) {
  const base =
    "w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer";

  const states = {
    true: "bg-green-600 justify-end",
    false: "bg-red-600 justify-start",
    null: "bg-neutral-600 justify-start",
  };

  return (
    <div
      className={`${base} ${value === true ? states.true : value === false ? states.false : states.null}`}
      onClick={() => {
        if (value === null) onChange(true);
        else if (value === true) onChange(false);
        else onChange(null);
      }}
    >
      <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
    </div>
  );
}
