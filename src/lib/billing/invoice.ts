import { BRAND_CONFIG } from "@/config/brand";

export interface InvoiceItem {
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  credits: number;
  unitPriceExclusiveAed: number;
  vatRate: number; // 0.05
  vatAmountAed: number;
  totalInclusiveAed: number;
}

export interface TaxInvoice {
  invoiceNumber: string;
  date: string;
  issuer: {
    name: string;
    address: string;
    country: string;
    trn?: string;
  };
  buyer: {
    userId: string;
    phone: string;
    companyName?: string;
    trn?: string;
  };
  items: InvoiceItem[];
  subtotalExclusiveAed: number;
  totalVatAed: number;
  totalInclusiveAed: number;
  currency: "AED";
  status: "PAID";
}

export class TaxInvoiceGenerator {
  static readonly VAT_RATE = 0.05; // 5% UAE VAT

  /**
   * Calculate exact 5% UAE VAT breakdown from gross VAT-inclusive AED price
   */
  static computeVatBreakdown(grossInclusiveAed: number): {
    exclusiveAed: number;
    vatAmountAed: number;
    inclusiveAed: number;
  } {
    // Formula: Exclusive = Gross / 1.05
    const exclusive = Number((grossInclusiveAed / (1 + this.VAT_RATE)).toFixed(2));
    const vat = Number((grossInclusiveAed - exclusive).toFixed(2));
    return {
      exclusiveAed: exclusive,
      vatAmountAed: vat,
      inclusiveAed: Number(grossInclusiveAed.toFixed(2)),
    };
  }

  /**
   * Generate bilingual UAE Tax Invoice
   */
  static generateInvoice(params: {
    invoiceNumber: string;
    userId: string;
    buyerPhone: string;
    companyName?: string;
    buyerTrn?: string;
    packageId: string;
    packageNameEn: string;
    packageNameAr: string;
    credits: number;
    grossInclusiveAed: number;
  }): TaxInvoice {
    const { exclusiveAed, vatAmountAed, inclusiveAed } = this.computeVatBreakdown(params.grossInclusiveAed);

    return {
      invoiceNumber: params.invoiceNumber,
      date: new Date().toISOString().split("T")[0],
      issuer: {
        name: BRAND_CONFIG.legalEntity,
        address: BRAND_CONFIG.hubLocation,
        country: "United Arab Emirates",
        trn: "100-XXXX-XXXX-0003", // Placeholder UAE TRN for pre-incorporation
      },
      buyer: {
        userId: params.userId,
        phone: params.buyerPhone,
        companyName: params.companyName || "UAE Jewellery Retailer",
        trn: params.buyerTrn,
      },
      items: [
        {
          descriptionEn: `${params.packageNameEn} (${params.credits} Studio Credits)`,
          descriptionAr: `${params.packageNameAr} (${params.credits} رصيد استوديو)`,
          quantity: 1,
          credits: params.credits,
          unitPriceExclusiveAed: exclusiveAed,
          vatRate: this.VAT_RATE,
          vatAmountAed,
          totalInclusiveAed: inclusiveAed,
        },
      ],
      subtotalExclusiveAed: exclusiveAed,
      totalVatAed: vatAmountAed,
      totalInclusiveAed: inclusiveAed,
      currency: "AED",
      status: "PAID",
    };
  }

  /**
   * Render printable HTML tax invoice
   */
  static renderHtml(invoice: TaxInvoice): string {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Tax Invoice / فاتورة ضريبية - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #b45309; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 12px; text-align: right; }
          .table th { background: #f8fafc; font-weight: 600; }
          .total-box { margin-top: 20px; margin-left: auto; width: 320px; text-align: left; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 6px; color: #b45309; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">فاتورة ضريبية / TAX INVOICE</div>
            <p><strong>رقم الفاتورة / Invoice No:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>التاريخ / Date:</strong> ${invoice.date}</p>
            <p><strong>الحالة / Status:</strong> تم السداد بالكامل / PAID</p>
          </div>
          <div style="text-align: left;" dir="ltr">
            <strong>${invoice.issuer.name}</strong><br />
            ${invoice.issuer.address}<br />
            ${invoice.issuer.country}<br />
            TRN: ${invoice.issuer.trn}
          </div>
        </div>

        <div style="margin-top: 20px;">
          <strong>العميل / Buyer:</strong> ${invoice.buyer.companyName} (${invoice.buyer.phone})<br />
          ${invoice.buyer.trn ? `TRN: ${invoice.buyer.trn}` : ""}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>الوصف / Description</th>
              <th>الكمية / Qty</th>
              <th>السعر قبل الضريبة / Net (AED)</th>
              <th>نسبة الضريبة / VAT %</th>
              <th>مبلغ الضريبة / VAT (AED)</th>
              <th>الإجمالي شامل الضريبة / Total (AED)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.descriptionAr}<br /><small style="color: #64748b;">${item.descriptionEn}</small></td>
                <td>${item.quantity}</td>
                <td>${item.unitPriceExclusiveAed.toFixed(2)}</td>
                <td>5%</td>
                <td>${item.vatAmountAed.toFixed(2)}</td>
                <td><strong>${item.totalInclusiveAed.toFixed(2)}</strong></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>المجموع قبل الضريبة / Subtotal:</span>
            <span>${invoice.subtotalExclusiveAed.toFixed(2)} AED</span>
          </div>
          <div class="total-row">
            <span>ضريبة القيمة المضافة (5%) / VAT (5%):</span>
            <span>${invoice.totalVatAed.toFixed(2)} AED</span>
          </div>
          <div class="total-row grand-total">
            <span>الإجمالي المستحق / Total Payable:</span>
            <span>${invoice.totalInclusiveAed.toFixed(2)} AED</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
