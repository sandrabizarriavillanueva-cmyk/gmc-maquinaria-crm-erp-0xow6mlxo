import { Invoice, Client } from '@/types'
import { formatCLP } from './format'

export const printInvoice = (invoice: Invoice, client: Client, logo?: string | null) => {
  const net = Math.round(invoice.amount / 1.19)
  const iva = invoice.amount - net

  const logoHtml = logo
    ? `<img src="${logo}" style="height: 50px; object-fit: contain;" />`
    : `<div class="logo">GMC Maquinaria</div>`

  const signatureHtml = invoice.signatureUrl
    ? `
    <div style="margin-top: 40px; text-align: right; float: right;">
      <p style="margin-bottom: 5px; color: #475569; font-size: 12px;">Firma de Conformidad del Cliente:</p>
      <img src="${invoice.signatureUrl}" style="height: 80px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;" />
    </div>
  `
    : ''

  const html = `
    <html>
      <head>
        <title>Documento ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f97316; padding-bottom: 20px; align-items: flex-end; }
          .logo { font-size: 26px; font-weight: 900; color: #f97316; letter-spacing: -0.5px; }
          .info { margin-top: 25px; display: flex; justify-content: space-between; font-size: 14px; line-height: 1.6; }
          .table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 14px; }
          .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; }
          .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500; }
          .totals { margin-top: 30px; width: 320px; float: right; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; color: #475569; }
          .total-row.bold { font-weight: bold; font-size: 18px; border-top: 2px solid #1e293b; padding-top: 12px; color: #f97316; }
          .footer { clear: both; margin-top: 80px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>${logoHtml}</div>
          <div style="text-align: right">
            <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">
              ${invoice.description?.includes('Cotización') ? 'Cotización Comercial' : 'Factura Electrónica'}
            </h2>
            <p style="margin: 4px 0; font-weight: bold; font-size: 16px;">Nº ${invoice.invoiceNumber}</p>
            <p style="margin: 0; color: #64748b;">Fecha: ${invoice.date}</p>
          </div>
        </div>
        <div class="info">
          <div>
            <strong>Señor(es):</strong> ${client.name}<br>
            <strong>RUT:</strong> ${client.rut}<br>
            <strong>Giro:</strong> ${client.industry || 'Industrial'}<br>
            <strong>Dirección:</strong> ${client.region}
          </div>
          <div style="text-align: right">
            <strong>RUT Emisor:</strong> 76.543.210-K<br>
            <strong>Giro:</strong> Venta y Arriendo de Maquinaria<br>
            <strong>Dirección:</strong> Av. Industrial 1234, Antofagasta
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Descripción del Servicio / Equipo</th>
              <th style="text-align: right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.description}</td>
              <td style="text-align: right">${formatCLP(invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row"><span>Monto Neto:</span> <span>${formatCLP(net)}</span></div>
          <div class="total-row"><span>IVA (19%):</span> <span>${formatCLP(iva)}</span></div>
          <div class="total-row bold"><span>Total CLP:</span> <span>${formatCLP(invoice.amount)}</span></div>
        </div>
        ${signatureHtml}
        <div class="footer">
          Documento generado automáticamente por GMC Maquinaria ERP.
        </div>
        <script>
          window.onload = () => { setTimeout(() => window.print(), 300); }
        </script>
      </body>
    </html>
  `
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
