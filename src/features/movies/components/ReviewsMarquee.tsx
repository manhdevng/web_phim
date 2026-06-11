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
      '"Một kiệt tác thị giác! Cảm giác như được đưa thẳng tới Rome những năm 1960. Danh sách phim thực sự chất lượng."',
    initial: "M",
    name: "Minh Châu",
    bgClass: "bg-cinema-redlight",
    rotation: -2,
  },
  {
    rating: 4,
    quote:
      '"Không gian của website cũng nghệ thuật như chính những bộ phim vậy. Một thiên đường thực sự cho những ai yêu điện ảnh."',
    initial: "H",
    name: "Hoàng Bách",
    bgClass: "bg-stone-800",
    textClass: "text-cinema-gold",
    rotation: 3,
  },
  {
    rating: 5,
    quote:
      '"Cuối cùng cũng có một nơi trân trọng những giá trị điện ảnh kinh điển. Chất lượng phát phim thực sự rất tuyệt vời."',
    initial: "N",
    name: "Ngọc Anh",
    bgClass: "bg-cinema-redlight",
    rotation: -1,
  },
  {
    rating: 4,
    quote:
      '"Tôi đã khám phá ra nhiều tác phẩm nghệ thuật kinh điển tại đây. Những bộ phim được tuyển chọn tốt hơn bất kỳ thuật toán nào."',
    initial: "T",
    name: "Thái Hòa",
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
            className={`w-3 h-3 ${i < review.rating ? "fill-cinema-gold" : ""}`}
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
          Đánh giá từ khán giả
        </h2>
        <p className="text-sm text-stone-500 mt-2">
          Những chia sẻ từ cộng đồng mọt phim tại PhimHayViet.
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
