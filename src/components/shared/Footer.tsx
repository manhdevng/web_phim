import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-cinema-redlight/20 py-12 px-4 md:px-8 flex flex-col gap-12 text-stone-500 bg-[#0a0a0a]/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Column 1: Address */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-stone-300 text-lg tracking-tight">
            Lumière Cinémathèque
          </h4>
          <p className="text-xs font-light leading-relaxed">
            14 Rue Le Peletier
            <br />
            75009 Paris, France
            <br />
            Arrondissement IX
          </p>
        </div>

        {/* Column 2: Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-stone-300 text-lg tracking-tight">
            Liên hệ
          </h4>
          <p className="text-xs font-light leading-relaxed">
            SĐT: +33 1 42 68 53 20
            <br />
            Vé: billetterie@lumiere.fr
            <br />
            Quản lý: direction@lumiere.fr
          </p>
        </div>

        {/* Column 3: Hours */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif text-stone-300 text-lg tracking-tight">
            Giờ mở cửa
          </h4>
          <p className="text-xs font-light leading-relaxed">
            Thứ 2 - Thứ 5: 14:00 - 23:30
            <br />
            Thứ 6 - Chủ Nhật: 11:00 - 01:00
            <br />
            Chiếu phim sáng Chủ Nhật hàng tuần
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600 pt-8 border-t border-cinema-redlight/10">
        <div className="font-serif tracking-widest uppercase text-stone-400">
          Lumière © 2024
        </div>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-cinema-gold transition-colors">
            Manifesto
          </Link>
          <Link href="#" className="hover:text-cinema-gold transition-colors">
            Terms of Patronage
          </Link>
          <Link href="#" className="hover:text-cinema-gold transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
