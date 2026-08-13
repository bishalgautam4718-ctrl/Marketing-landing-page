"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const services = [
  ["AI Content Engine", "On-brand social content and campaigns that stay consistent without slowing your team down."],
  ["Lead Generation", "Targeted ads, smart funnels, and follow-up systems designed to turn attention into qualified leads."],
  ["Marketing Automation", "Connect the tools your business already uses and create a smoother path from first click to client."],
];

const outcomes = [
  ["01", "Discover", "We learn your offer, audience, and growth bottlenecks."],
  ["02", "Design", "We turn the clearest opportunities into a focused AI marketing plan."],
  ["03", "Deploy", "We launch, measure, and continuously refine the system around what works."],
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/consultation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json(); setSubmitting(false);
    if (response.ok) router.push("/thank-you"); else setError(result.error || "Something went wrong. Please try again.");
  }
  const scrollToContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  return <main>
    <nav className="nav wrap"><a href="#top" className="brand"><img src="/logo.png" alt="AIwithBishal" /></a><div className="nav-links"><a href="#services">Services</a><a href="#process">Process</a><a href="#contact">Contact</a></div><button className="nav-cta" onClick={scrollToContact}>Book a strategy call <b>↗</b></button></nav>
    <section id="top" className="hero"><div className="glow glow-one" /><div className="glow glow-two" /><div className="grid" /><div className="wrap hero-grid"><div className="hero-copy"><p className="eyebrow"><i /> AI POWERED DIGITAL MARKETING</p><h1>Turn attention into <em>measurable growth.</em></h1><p className="lede">Strategic marketing, intelligent automation, and content systems built for businesses ready to grow with clarity.</p><div className="buttons"><button className="primary" onClick={scrollToContact}>Get your free growth plan <span>→</span></button><button className="text-button" onClick={() => document.getElementById("services")?.scrollIntoView({behavior:"smooth"})}>Explore services <span>↓</span></button></div><div className="proof"><div className="avatars"><span>✦</span><span>✦</span><span>✦</span></div><p>Built for forward-thinking<br/><strong>founders and teams</strong></p></div></div><div className="hero-art"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="signal"><div className="signal-top"><span>AI GROWTH SYSTEM</span><i>● LIVE</i></div><div className="signal-body"><div className="metric"><small>Qualified leads</small><strong>+184%</strong><span>vs. previous period ↗</span></div><div className="bars"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="signal-foot"><span>Strategy</span><span>Automation</span><span>Performance</span></div></div><div className="floating-card"><small>OPTIMIZING CAMPAIGNS</small><b><i /> AI working for you</b></div><div className="core">AI</div></div></div></section>
    <section className="trust"><div className="wrap trust-inner"><span>Not more marketing noise.</span><b>More signal.</b><span>A system that compounds.</span></div></section>
    <section id="services" className="section wrap"><div className="section-intro"><p className="eyebrow dark"><i /> WHAT WE BUILD</p><h2>Marketing with more <em>momentum.</em></h2><p>Human strategy meets practical AI—so your marketing can work smarter, move faster, and feel unmistakably like your brand.</p></div><div className="service-list">{services.map(([title, text], i) => <article className="service" key={title}><div><span className="number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div><button aria-label={`Learn about ${title}`} onClick={scrollToContact}>↗</button></article>)}</div></section>
    <section id="process" className="process"><div className="wrap"><div className="process-head"><p className="eyebrow"><i /> A CLEARER WAY FORWARD</p><h2>Strategy first.<br/><em>Scale follows.</em></h2><button className="outline" onClick={scrollToContact}>Let&apos;s talk <span>→</span></button></div><div className="steps">{outcomes.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>
    <section className="quote wrap"><div className="quote-mark">“</div><blockquote>Great marketing does not just reach people. It reaches the <em>right people</em>, with the right message, at the right time.</blockquote></section>
    <section id="contact" className="contact"><div className="wrap contact-box"><div><p className="eyebrow dark"><i /> START THE CONVERSATION</p><h2>Ready to grow<br/><em>with intention?</em></h2><p>Tell us where you want to go. We&apos;ll show you the clearest path forward.</p></div><div className="contact-actions"><button className="primary" onClick={() => setOpen(true)}>Book a free strategy call <span>→</span></button><a href="mailto:hello@aiwithbishal.com">hello@aiwithbishal.com <b>↗</b></a></div></div></section>
    <footer className="footer wrap"><a href="#top" className="brand"><img src="/logo.png" alt="AIwithBishal" /></a><p>© {new Date().getFullYear()} AIwithBishal. Built for meaningful growth.</p><div><a href="#services">Services</a><a href="#contact">Contact</a></div></footer>
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={() => setOpen(false)}>×</button><p className="eyebrow dark"><i /> ONE-TO-ONE CONSULTATION</p><h2>Let&apos;s talk growth.</h2><p>Share a few details and we&apos;ll contact you personally to arrange your consultation.</p><form onSubmit={submit}><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" required type="email" placeholder="you@company.com" /></label><label>Phone number<input name="phone" required type="tel" placeholder="Your phone number" /></label><label>Business / brand<input name="business" required placeholder="Your business name" /></label><label>What would you like to grow?<textarea name="goals" required placeholder="Tell us a little about your business and goals" rows={3} /></label>{error && <p className="form-error">{error}</p>}<button className="primary" disabled={submitting} type="submit">{submitting ? "Sending request..." : <>Request my consultation <span>→</span></>}</button></form></div></div>}
  </main>;
}
