import Link from "next/link";

export default function Thanks() {
  return (
    <main className="thank-you">
      <section>
        <a className="thank-brand" href="/"><img src="/logo.png" alt="AIwithBishal"/></a>
        <div className="check">✓</div>
        <p className="eyebrow dark"><i /> REQUEST RECEIVED</p>
        <h1>Thank you for reaching out.</h1>
        <p>We&apos;ve received your request for a one-to-one AI marketing consultation. A confirmation email is on its way, and we&apos;ll be in touch shortly to arrange your call.</p>

        <div className="thank-video">
          <iframe
            src="https://www.youtube.com/embed/67t87u8rq2w"
            title="AIwithBishal video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <h2>Have a question right now?</h2>
        <p className="thank-chat-copy">Send me a WhatsApp message and I&apos;ll get back to you personally.</p>
        <div className="thank-actions">
          <a className="whatsapp-button" href="https://wa.me/message/WN3WGIY3SP7GG1" target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp <span>↗</span>
          </a>
          <Link className="primary" href="/">Back to home <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
