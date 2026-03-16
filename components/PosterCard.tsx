import Image from "next/image";

interface PosterCardProps {
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
  aspect?: "4/5" | "2/3";
  grayscale?: boolean;
  showTicketButton?: boolean;
}

export default function PosterCard({
  image,
  title,
  subtitle,
  badge,
  aspect = "4/5",
  grayscale = false,
  showTicketButton = false,
}: PosterCardProps) {
  return (
    <div className="group flex flex-col gap-3 poster-card cursor-pointer">
      <div
        className={`w-full bg-zinc-900 rounded-sm overflow-hidden relative border border-white/5 group-hover:border-cinema-gold/30 transition-colors duration-500`}
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={image}
          className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ${
            grayscale ? "grayscale group-hover:grayscale-0" : ""
          }`}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Overlay with badge/info or ticket button */}
        {showTicketButton ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
            <button className="w-full py-2 bg-cinema-red/90 text-stone-200 text-xs rounded backdrop-blur-sm border border-cinema-redlight hover:bg-cinema-redlight transition-colors">
              Get Tickets
            </button>
          </div>
        ) : (
          <div className="flex flex-col bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 absolute inset-0 justify-end">
            {badge && (
              <div className="bg-cinema-red/90 text-stone-200 text-xs px-2 py-1 rounded backdrop-blur-sm w-max mb-2 border border-cinema-redlight">
                {badge}
              </div>
            )}
            <h3 className="font-serif text-xl md:text-2xl text-stone-200 group-hover:text-cinema-gold transition-colors tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-stone-400 mt-1 font-light">{subtitle}</p>
          </div>
        )}
      </div>

      {/* External title for grid cards */}
      {showTicketButton && (
        <div>
          <h3 className="font-serif text-base text-stone-200 group-hover:text-cinema-gold transition-colors">
            {title}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{subtitle}</p>
        </div>
      )}
    </div>
  );
}
