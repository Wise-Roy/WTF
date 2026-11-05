"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function PressPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/press", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => {
        setImages(d.data?.images || []);
        setLoading(false);
      })
      .catch(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Browsers block autoplay with sound, so the video starts muted and unmutes on click
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) {
      v.play();
      setPlaying(true);
    }
  };

  return (
    <main className="bg-[#1a1a1a]">
      {/* Intro video */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="/intro.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute bottom-8 right-6 md:right-12 z-10 flex gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Stop video" : "Play video"}
            className="h-12 w-12 rounded-full bg-black/50 border border-[#C6FF00]/60 text-[#C6FF00] flex items-center justify-center hover:bg-[#C6FF00] hover:text-[#1a1a1a] transition-colors"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Turn music on" : "Turn music off"}
            className="h-12 w-12 rounded-full bg-black/50 border border-[#C6FF00]/60 text-[#C6FF00] flex items-center justify-center hover:bg-[#C6FF00] hover:text-[#1a1a1a] transition-colors"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </section>

      {/* Press gallery */}
      <section className="px-6 md:px-12 lg:px-20 py-20">
        <div className="mx-auto max-w-7xl">
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider leading-tight mb-12 drop-shadow-lg title-glow-lime"
            style={{ WebkitTextStroke: "1.5px #C6FF00", color: "black" }}
          >
            Press
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] overflow-hidden bg-white/5">
                  <Image
                    src={url}
                    alt={`Press ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 py-20 text-lg">No press coverage yet. Stay tuned.</p>
          )}
        </div>
      </section>
    </main>
  );
}
