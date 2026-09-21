import { REVIEWS } from "@/lib/constants";
import { SectionWrapper, Tagline, SectionHeading, StarRating } from "@/components/common";
import { Review } from "@/types";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-[#1a1a1a]/10 p-8">
      <StarRating rating={review.rating} />
      <p className="mt-4 font-body text-lg md:text-xl text-[#1a1a1a]/80 leading-relaxed">{review.text}</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-bold text-[#C6FF00]">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a1a1a]">{review.name}</p>
          <p className="text-xs text-[#1a1a1a]/50">
            {review.dropLabel} &middot; Verified buyer
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CultSpeaks() {
  return (
    <SectionWrapper scheme="dark">
      <div className="text-center">
        <Tagline>The Cult Speaks</Tagline>
        <SectionHeading className="mt-6">
          Don&apos;t take our word for it
        </SectionHeading>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </SectionWrapper>
  );
}
