"use client";

import { useState } from "react";
import { PageHeader, SectionWrapper, Input, Button } from "@/components/common";

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
      <PageHeader
        tagline="Get in touch"
        heading="Contact us"
        description="Got a question, collab idea, or just want to talk weird? We're listening."
      />

      <SectionWrapper scheme="dark">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-16">
              <h3 className="font-heading text-3xl uppercase tracking-wider text-[#C6FF00] font-bold">
                Message sent.
              </h3>
              <p className="mt-4 text-[#F5F5F5]/70">
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
                <label className="block text-sm font-bold uppercase tracking-wider text-[#F5F5F5] mb-2">
                  Name
                </label>
                <Input
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#F5F5F5] mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@weird.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#F5F5F5] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="What's on your mind?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full border border-white/20 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 outline-none focus:border-[#C6FF00] transition-colors resize-none"
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
