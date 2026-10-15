import nodemailer from 'nodemailer';
import type { WholesaleLead } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Transporte de e-mail.
 * - Com SMTP_HOST configurado: envia de verdade.
 * - Sem SMTP_HOST: usa jsonTransport e só imprime no console (ótimo para dev).
 */
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Avisa a loja por e-mail quando chega um novo pedido de catálogo atacado. */
export async function sendWholesaleLeadEmail(lead: WholesaleLead) {
  const digits = lead.whatsapp.replace(/\D/g, '');
  const rows: [string, string][] = [
    ['Nome', lead.name],
    ['Cidade', lead.city],
    ['WhatsApp', lead.whatsapp],
    ['CNPJ', lead.cnpj || '—'],
    ['Mensagem', lead.message || '—'],
  ];

  const html = `
    <h2 style="font-family:sans-serif">Novo revendedor interessado 👟</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px;font-weight:bold">${k}</td><td style="padding:6px 12px">${escape(v)}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="font-family:sans-serif">
      <a href="https://wa.me/55${digits}">Responder no WhatsApp</a>
    </p>`;

  const subject = `Novo lead atacado: ${lead.name} (${lead.city})`;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: env.MAIL_TO || env.SMTP_USER || 'loja@example.com',
    subject,
    html,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
  });

  if (!env.SMTP_HOST) {
    console.log(`📧 [dev] SMTP não configurado — e-mail simulado: "${subject}"`);
  }
}
