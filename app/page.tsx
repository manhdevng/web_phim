import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import NowShowingSection from "@/components/NowShowingSection";
import MarqueeStudios from "@/components/MarqueeStudios";
import CuratedSection from "@/components/CuratedSection";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import Footer from "@/components/Footer";
import SpotlightWrapper from "@/components/SpotlightWrapper";

export default function Home() {
  return (
    <SpotlightWrapper>
      <Navbar />
      <div className="px-4 md:px-8 flex flex-col gap-y-16 md:gap-24 pt-8 md:pt-28 pb-32">
        <HeroSlider />
        <NowShowingSection />
        <MarqueeStudios />
        <CuratedSection />
        <ReviewsMarquee />
      </div>
      <Footer />
    </SpotlightWrapper>
  );
}
