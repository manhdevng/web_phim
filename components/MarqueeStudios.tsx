import { Circle } from "lucide-react";

const studios = ["Gaumont", "Pathé", "UFA", "Cinecittà", "Ealing"];

function StudioList() {
  return (
    <div className="flex-1 flex justify-around items-center text-stone-500 font-serif tracking-widest text-sm uppercase opacity-60">
      {studios.map((studio, index) => (
        <span key={index} className="flex items-center gap-0">
          {index > 0 && (
            <Circle className="w-2 h-2 text-cinema-redlight fill-cinema-redlight mr-[calc(100vw/15)]" />
          )}
          <span>{studio}</span>
        </span>
      ))}
    </div>
  );
}

export default function MarqueeStudios() {
  return (
    <section className="w-full py-4 border-y border-cinema-redlight/20 reveal-element overflow-hidden mask-edges">
      <div className="flex w-[200%] animate-marquee">
        <StudioList />
        <StudioList />
      </div>
    </section>
  );
}
