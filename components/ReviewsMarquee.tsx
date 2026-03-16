import { Star } from "lucide-react";

interface Review {
  rating: number;
  quote: string;
  initial: string;
  name: string;
  bgClass: string;
  textClass?: string;
  rotation: number;
}

const reviews: Review[] = [
  {
    rating: 5,
    quote:
      '"A visual masterpiece that transported me straight to 1960s Rome. Impeccable curation."',
    initial: "M",
    name: "Marion C.",
    bgClass: "bg-cinema-redlight",
    rotation: -2,
  },
  {
    rating: 4,
    quote:
      '"The atmosphere of this platform is as good as the films themselves. A true cinephile\'s haven."',
    initial: "J",
    name: "Julian B.",
    bgClass: "bg-stone-800",
    textClass: "text-cinema-gold",
    rotation: 3,
  },
  {
    rating: 5,
    quote:
      '"Finally, a place that treats classic cinema with the reverence it deserves. The streaming quality is superb."',
    initial: "E",
    name: "Elena R.",
    bgClass: "bg-cinema-redlight",
    rotation: -1,
  },
  {
    rating: 4,
    quote:
      '"I discovered French New Wave here. The curated lists are better than any algorithm."',
    initial: "T",
    name: "Thomas H.",
    bgClass: "bg-stone-800",
    textClass: "text-cinema-gold",
    rotation: 4,
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="w-64 flex-shrink-0 polaroid"
      style={{ "--rotation": review.rotation } as React.CSSProperties}
    >
      {/* Stars */}
      <div className="flex text-cinema-gold mb-2 text-xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < review.rating ? "fill-cinema-gold" : ""
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-stone-300 italic mb-4">{review.quote}</p>

      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full ${review.bgClass} flex items-center justify-center text-xs font-serif ${review.textClass || ""}`}
        >
          {review.initial}
        </div>
        <span className="text-xs text-stone-500 uppercase tracking-wider">
          {review.name}
        </span>
      </div>
    </div>
  );
}

export default function ReviewsMarquee() {
  return (
    <section className="flex flex-col gap-8 reveal-element overflow-hidden py-8">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-stone-100 tracking-tight">
          Audience Reviews
        </h2>
        <p className="text-sm text-stone-500 mt-2">
          Critiques from our esteemed patrons.
        </p>
      </div>

      <div className="w-full mask-edges py-8">
        <div className="flex gap-6 w-[200%] animate-marquee hover:[animation-play-state:paused]">
          {/* First loop */}
          {reviews.map((review, index) => (
            <ReviewCard key={`a-${index}`} review={review} />
          ))}
          {/* Duplicate for seamless loop */}
          {reviews.map((review, index) => (
            <ReviewCard key={`b-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
