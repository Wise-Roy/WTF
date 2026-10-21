"use client";

import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { SIZES, recommendSize, type SizeResult } from "@/lib/sizes";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });

function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`inline-block w-4 h-4 ${className}`}
    >
      <path d="M12 1.7l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.31L12 1.7z" />
    </svg>
  );
}


/* ═══════════════════════════════════════════
   SIZE CHART SECTION
   ═══════════════════════════════════════════ */

function SizeChart() {
  return (
    <section id="chart" className="bg-[#C6FF00] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2
              className={`${bebas.className} text-6xl md:text-8xl leading-[0.85]`}
              style={{ WebkitTextStroke: "1.5px #DF2877", color: "white" }}
            >
              SIZE CHART
            </h2>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
        className="border-2 border-[#1a1a1a] bg-[#1a1a1a] mt-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#C6FF00]">
            <table className="w-full min-w-[560px] text-center border-collapse">
              <thead>
                <tr>
                  {["SIZE", "BUST", "WAIST", "HIPS"].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className={`${bebas.className} text-[#DF2877] text-2xl md:text-3xl tracking-widest px-4 py-5 border-b-2 border-[#C6FF00]/60`}
                    >
                      {col}
                      {col !== "SIZE" && (
                        <span className="block text-sm text-[#C6FF00]/70 tracking-[0.3em]">
                          (in)
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`group transition-colors hover:bg-[#DF2877]/25 ${
                      i < SIZES.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <td
                      className={`${bebas.className} text-[#C6FF00] group-hover:text-white text-2xl md:text-3xl px-4 py-4 transition-colors`}
                    >
                      {row.label}
                    </td>
                    <td className={`${bebas.className} text-white text-2xl md:text-3xl px-4 py-4`}>
                      {row.bust}
                    </td>
                    <td className={`${bebas.className} text-white text-2xl md:text-3xl px-4 py-4`}>
                      {row.waist}
                    </td>
                    <td className={`${bebas.className} text-white text-2xl md:text-3xl px-4 py-4`}>
                      {row.hips}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footnote */}
        <p className="mt-6 flex items-center justify-center gap-2 text-[#1a1a1a]/70 text-xs md:text-sm font-bold uppercase tracking-widest text-center">
          <Star className="text-[#DF2877]" />
          BADDIES OF ALL SIZES
          <Star className="text-[#DF2877]" />
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SIZE FINDER SECTION
   ═══════════════════════════════════════════ */

function SizeFinder() {
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [result, setResult] = useState<SizeResult | null>(null);
  const [error, setError] = useState(false);
  const formControls = useAnimation();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      bust: bust ? parseFloat(bust) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
    };

    const res = recommendSize(input);

    if (res.status === "error") {
      setResult(null);
      setError(true);
      formControls.start({
        x: [0, -10, 10, -6, 6, 0],
        transition: { duration: 0.5 },
      });
      setTimeout(() => setError(false), 700);
      return;
    }

    setError(false);
    setResult(res);
  };

  const handleReset = () => {
    setBust("");
    setWaist("");
    setHips("");
    setResult(null);
    setError(false);
  };

  const resultKey =
    result?.status === "size"
      ? `size-${result.size.label}-${result.drivers.map((d) => `${d.field}${d.value}`).join("-")}`
      : result?.status === "off-chart"
        ? "off-chart"
        : "";

  return (
    <section
      id="finder"
      className="bg-[#C6FF00] border-t-2 border-[#1a1a1a] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className={`${bebas.className} text-[#1a1a1a] text-6xl md:text-8xl leading-[0.85]`}
          >
            FIND YOUR SIZE
          </h2>
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/70 mt-2">
            Punch in your numbers. We&apos;ll do the math.
          </p>
        </motion.div>

        {/* Tool card */}
        <motion.div
          className="max-w-3xl mx-auto mt-10 bg-[#1a1a1a] border-2 border-[#1a1a1a] p-6 md:p-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            animate={formControls}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {(
              [
                { id: "bust", label: "BUST", value: bust, set: setBust },
                { id: "waist", label: "WAIST", value: waist, set: setWaist },
                { id: "hips", label: "HIPS", value: hips, set: setHips },
              ] as const
            ).map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="flex items-center gap-1.5 text-[#DF2877] font-bold uppercase tracking-widest text-xs mb-2"
                >
                  {field.label}
                  <Star className="text-[#C6FF00] w-3 h-3" />
                  <span className="text-white/40">(inches)</span>
                </label>
                <input
                  id={field.id}
                  type="number"
                  inputMode="decimal"
                  min={18}
                  max={70}
                  step={0.5}
                  placeholder="—"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className={`${bebas.className} w-full bg-[#FFF9D6] border-2 border-white/20 focus:border-[#C6FF00] text-3xl tracking-wider text-center px-4 py-3 outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30`}
                />
              </div>
            ))}

            <button
              type="submit"
              className="md:col-span-3 w-full bg-[#C6FF00] hover:bg-[#d4ff33] text-[#1a1a1a] font-bold uppercase tracking-widest py-4 px-6 border-2 border-[#1a1a1a] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Star className="text-[#1a1a1a] w-4 h-4" />
              REVEAL MY SIZE
              <Star className="text-[#1a1a1a] w-4 h-4" />
            </button>
          </motion.form>

          {/* Error */}
          {error && (
            <p className="text-[#DF2877] text-xs font-bold uppercase tracking-widest text-center mt-4">
              Give us at least one number, weirdo.
            </p>
          )}

          {/* Result */}
          {result && result.status !== "error" && (
            <motion.div
              key={resultKey}
              className="border-t-2 border-white/10 pt-8 mt-8 text-center"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {result.status === "size" && (
                <>
                  <p className="text-white/50 font-bold uppercase tracking-[0.3em] text-xs">
                    YOU&apos;RE A
                  </p>
                  <p
                    className={`${bebas.className} text-[#C6FF00] text-8xl md:text-9xl leading-none`}
                  >
                    {result.size.label}
                  </p>

                  {/* Driver chips */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {result.drivers.map((d) => (
                      <span
                        key={d.field}
                        className="inline-flex items-center gap-1.5 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-3 py-1.5"
                      >
                        <Star className="text-[#DF2877] w-3 h-3" />
                        {d.field.toUpperCase()} {d.value}&Prime; &rarr; {d.fits}
                      </span>
                    ))}
                  </div>

                  {/* Verdict */}
                  <p className="text-white/60 text-sm md:text-base max-w-md mx-auto leading-relaxed mt-4">
                    {result.deadOn
                      ? "Dead on. The tape doesn't lie and neither do you."
                      : "Between sizes? Size up — oversized is the point."}
                  </p>
                </>
              )}

              {result.status === "off-chart" && (
                <>
                  <p
                    className={`${bebas.className} text-[#DF2877] text-5xl md:text-6xl`}
                  >
                    OFF THE CHART
                  </p>
                  <p className="text-white/70 text-sm md:text-base max-w-md mx-auto leading-relaxed mt-4">
                    You&apos;re beyond the chart — in a good way. Email{" "}
                    <a
                      href="mailto:hello@wxrshipthefumes.com"
                      className="text-[#C6FF00] hover:underline"
                    >
                      hello@wxrshipthefumes.com
                    </a>{" "}
                    and we&apos;ll hook you up with something that fits like it was
                    made for you. Because it will be.
                  </p>
                </>
              )}

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 text-white/50 hover:text-[#C6FF00] text-xs font-bold uppercase tracking-widest transition-colors"
              >
                MEASURE AGAIN
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function SizingPage() {
  return (
    <div>
      <SizeChart />
      <SizeFinder />
    </div>
  );
}
