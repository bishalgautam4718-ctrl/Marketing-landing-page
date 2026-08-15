import Link from "next/link";

export default function Thanks() {
  return <main className="thank-you"><section><a className="thank-brand" href="/"><img src="/logo.png" alt="AIwithBishal"/></a><div className="check">✓</div><p className="eyebrow dark"><i /> REQUEST RECEIVED</p><h1>Thank you for reaching out.</h1><p>We&apos;ve received your request for a one-to-one AI marketing consultation. A confirmation email is on its way, and we&apos;ll be in touch shortly to arrange your call.</p><Link className="primary" href="/">Back to home <span>→</span></Link></section></main>;
}
