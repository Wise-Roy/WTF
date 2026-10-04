"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionWrapper, Input, Button, Tagline, SectionHeading } from "@/components/common";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend integration point
    setSubmitted(true);
  };

  return (
    <>
      {/* Header with peeking WTF logo */}
      <div className="relative bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Big tilted WTF logo — only ~25% visible, rest hidden behind top-right corner */}
        <div
          className="absolute pointer-events-none select-none opacity-[0.07]"
          style={{
            top: "-55%",
            right: "-15%",
            width: "500px",
            height: "500px",
            transform: "rotate(-15deg)",
          }}
        >
          <Image
            src="/clean_logo.png"
            alt=""
            fill
            className="object-contain"
            aria-hidden="true"
          />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <Tagline>Get in touch</Tagline>
          <SectionHeading className="mt-6">Contact us</SectionHeading>
          <p className="mt-6 max-w-2xl text-lg text-[#1a1a1a]/70">
            Got a question, collab idea, or just want to talk weird? We&apos;re listening.
          </p>
        </div>
      </div>

      <SectionWrapper scheme="dark">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-16">
              <h3 className="font-heading text-3xl uppercase tracking-wider text-[#C6FF00] font-bold">
                Message sent.
              </h3>
              <p className="mt-4 text-[#1a1a1a]/70">
                We&apos;ll get back to you faster than a drop sells out.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", message: "" });
                }}
                variant="secondary"
                className="mt-8"
              >
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">
                  Name
                </label>
                <Input
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="!text-[#1a1a1a] !border-[#1a1a1a]/20 !placeholder:text-[#1a1a1a]/40"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@weird.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="!text-[#1a1a1a] !border-[#1a1a1a]/20 !placeholder:text-[#1a1a1a]/40"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="What's on your mind?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full border border-[#1a1a1a]/20 bg-transparent px-4 py-3 text-base text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 outline-none focus:border-[#C6FF00] transition-colors resize-none"
                />
              </div>
              <Button type="submit" className="w-full">
                Send message
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper scheme="pink" className="text-center">
        <h3 className="font-heading text-3xl md:text-4xl uppercase tracking-wider font-bold">
          Or just join the cult
        </h3>
        <p className="mt-4 text-white/70 max-w-lg mx-auto">
          Skip the formalities. Get early access to every drop.
        </p>
        <Button href="/#join" className="mt-8">
          Get early access
        </Button>
      </SectionWrapper>
    </>
  );
}
