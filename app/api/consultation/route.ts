import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveConsultationLead } from "../../../lib/google-sheets";

export const runtime = "nodejs";

type Consultation = { name?: string; email?: string; phone?: string; business?: string; goals?: string };

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
const row = (label: string, value: string) => `<tr><td style="padding:10px 0;color:#60778e;width:38%;font-size:13px">${label}</td><td style="padding:10px 0;color:#09213c;font-weight:600;font-size:13px">${escapeHtml(value)}</td></tr>`;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Consultation;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const business = body.business?.trim() ?? "";
    const goals = body.goals?.trim() ?? "";
    if (!name || !phone || !business || !goals || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please complete all fields with a valid email address." }, { status: 400 });
    const leadId = `AWB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const receivedAt = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kathmandu",
    }).format(new Date());
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, BUSINESS_EMAIL, EMAIL_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !BUSINESS_EMAIL || !EMAIL_FROM) return NextResponse.json({ error: "Email delivery has not been configured yet." }, { status: 503 });
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, "") } });
    const shell = (content: string) => `<div style="background:#f4f8fc;padding:32px 16px;font-family:Arial,sans-serif;color:#09213c"><div style="max-width:600px;margin:auto;background:#fff;padding:35px;border-radius:8px;border-top:4px solid #0870d8"><div style="font-weight:800;font-size:21px;margin-bottom:26px">AI<span style="color:#0870d8">with</span>Bishal</div>${content}<hr style="border:0;border-top:1px solid #e1e8f0;margin:25px 0"/><p style="font-size:12px;color:#718499;margin:0">AI Powered Digital Marketing</p></div></div>`;
    await saveConsultationLead({ id: leadId, receivedAt, name, email, phone, business, goals });
    await Promise.all([
      transporter.sendMail({ from: EMAIL_FROM, to: BUSINESS_EMAIL, replyTo: email, subject: `New consultation request — ${name} (${leadId})`, html: shell(`<p style="color:#0870d8;font-size:12px;font-weight:bold;letter-spacing:1px">NEW CONSULTATION REQUEST</p><h1 style="font-size:27px;margin:8px 0 16px">A new client is ready to talk.</h1><table style="width:100%;border-collapse:collapse">${row("Lead ID", leadId)}${row("Received", receivedAt)}${row("Name", name)}${row("Email", email)}${row("Phone", phone)}${row("Business", business)}${row("Goals", goals)}${row("Status", "New Lead")}</table><p style="background:#e8f4ff;padding:14px;font-size:13px">Reply to this email or call the prospect to arrange their one-to-one consultation.</p>`) }),
      transporter.sendMail({ from: EMAIL_FROM, to: email, replyTo: BUSINESS_EMAIL, subject: `Your consultation request has been received — ${leadId}`, html: shell(`<p style="color:#0870d8;font-size:12px;font-weight:bold;letter-spacing:1px">CONSULTATION REQUEST RECEIVED</p><h1 style="font-size:27px;margin:8px 0 16px">Thanks, ${escapeHtml(name)}.</h1><p style="font-size:15px;line-height:1.7;color:#425a70">Your request for a one-to-one AI marketing consultation has been received. We&apos;ll review your goals and get in touch shortly to arrange a time that works for you.</p><div style="background:#e8f4ff;padding:16px;margin:20px 0"><strong>Reference:</strong> ${leadId}<br/><strong>Business:</strong> ${escapeHtml(business)}</div><p style="font-size:15px;line-height:1.7;color:#425a70">We&apos;re looking forward to learning about your business.</p>`) }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Consultation submission failed", error);
    return NextResponse.json({ error: "We could not send your request. Please try again or email us directly." }, { status: 500 });
  }
}
