import { Hero, MarqueeBand, LatestDrop, WTFWay, FlagshipSpotlight, JoinCult, OfferModal } from "@/components/home";

export default function Home() {
  return (
    <>
      <OfferModal />
      <Hero />
      <MarqueeBand />
      {/* Single continuous gradient spanning all four sections */}
      <div
        style={{
          background: `
            radial-gradient(ellipse at 18% 15%, rgba(244, 205, 181, 0.35) 0%, transparent 30%),
            radial-gradient(ellipse at 82% 22%, rgba(190, 174, 211, 0.22) 0%, transparent 32%),
            radial-gradient(ellipse at 75% 65%, rgba(198, 255, 0, 0.15) 0%, transparent 25%),
            radial-gradient(ellipse at 25% 80%, rgba(223, 40, 119, 0.2) 0%, transparent 28%),
            linear-gradient(180deg, #fff9e8 0%, #f8ead6 12%, #d4c8cc 21%, #a6a3b2 29%, #555363 38%, #292a38 48%, #3a4a2a 54%, #5a7a1a 62%, #88AF00 70%, #88AF00 76%, #a0703c 84%, #c04060 92%, #DF2877 100%)
          `,
        }}
      >
        <LatestDrop />
        <WTFWay />
        <FlagshipSpotlight />
        <JoinCult />
      </div>
    </>
  );
}
