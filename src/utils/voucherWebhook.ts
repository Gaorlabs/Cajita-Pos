import { Sale, StoreProfile } from '../types';

export interface WebhookDispatchResult {
  success: boolean;
  status: 'sent' | 'error' | 'network_error';
  message: string;
  ticketNumber?: string;
  rawResponse?: any;
}

export const DEFAULT_N8N_WEBHOOK_URL = 'https://mn8nwebhook.mariasuite.cloud/webhook/sale-receipt-dispatch';

/**
 * Format phone for Evolution API / Peru
 * If 9 digits starting with 9, prepends 51 -> 519XXXXXXXX
 * If already starts with 51 and 11 digits -> 519XXXXXXXX
 */
export function formatPeruPhoneForEvolution(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 9 && clean.startsWith('9')) {
    return `51${clean}`;
  }
  if (clean.startsWith('51') && clean.length === 11) {
    return clean;
  }
  return clean;
}

/**
 * Maps payment method from Cajita POS to n8n expected method:
 * metodosPago: { yape: 'Yape', plin: 'Plin', efectivo: 'Efectivo', tarjeta: 'Tarjeta' }
 */
export function mapPaymentMethodForN8n(method: string, reference?: string): 'yape' | 'plin' | 'efectivo' | 'tarjeta' {
  if (method === 'cash') return 'efectivo';
  if (method === 'card') return 'tarjeta';
  if (method === 'wallet') {
    const ref = (reference || '').toLowerCase();
    if (ref.includes('plin')) return 'plin';
    return 'yape';
  }
  return 'efectivo';
}

/**
 * Builds the exact payload expected by the n8n "Preparar Datos y HTML" node
 */
export function buildN8nSalePayload(
  sale: Sale,
  storeProfile: StoreProfile,
  customerPhone: string,
  customerName?: string
) {
  const formattedPhone = formatPeruPhoneForEvolution(customerPhone);

  return {
    tenant: {
      name: storeProfile.name || 'Mi Negocio',
      ruc: storeProfile.ruc || '20600000000',
      address: storeProfile.address || 'Lima, Perú'
    },
    customer: {
      name: customerName || sale.customerName || 'Cliente',
      phone: formattedPhone
    },
    sale: {
      ticketNumber: sale.ticketNumber,
      date: sale.date || new Date().toISOString(),
      cashierName: sale.cashierName || 'Cajero Principal',
      subtotal: Number(sale.subtotal || 0),
      discountTotal: Number(sale.discountTotal || 0),
      total: Number(sale.total || 0),
      payments: (sale.payments && sale.payments.length > 0)
        ? sale.payments.map((p) => ({
            method: mapPaymentMethodForN8n(p.method, p.reference),
            amount: Number(p.amount || 0)
          }))
        : [
            {
              method: 'efectivo' as const,
              amount: Number(sale.total || 0)
            }
          ],
      items: (sale.items || []).map((item) => {
        const displayName = item.productName + (item.variantName ? ` (${item.variantName})` : '');
        return {
          productName: displayName,
          quantity: item.quantity,
          subtotal: Number(item.subtotal || (item.unitPrice * item.quantity))
        };
      })
    }
  };
}

/**
 * Dispatches the sale voucher to the n8n webhook via proxy route to avoid CORS issues
 */
export async function sendSaleVoucherToN8n(
  webhookUrl: string,
  sale: Sale,
  storeProfile: StoreProfile,
  customerPhone: string,
  customerName?: string
): Promise<WebhookDispatchResult> {
  const url = (webhookUrl || DEFAULT_N8N_WEBHOOK_URL).trim();
  const payload = buildN8nSalePayload(sale, storeProfile, customerPhone, customerName);

  try {
    // We send via /api/dispatch-voucher on our server to eliminate CORS preflight blocks
    const response = await fetch('/api/dispatch-voucher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl: url,
        payload,
      }),
    });

    const resJson = await response.json();

    if (!response.ok) {
      const errMsg = resJson.error || resJson.data?.message || 'Error en servidor proxy';
      return {
        success: false,
        status: 'error',
        message: errMsg,
        rawResponse: resJson,
      };
    }

    const { httpStatus, data } = resJson;

    // Handle n8n specific response when the workflow is not active
    if (httpStatus === 404 && data?.hint) {
      return {
        success: false,
        status: 'error',
        message: `El workflow en n8n está inactivo: "${data.message || 'Webhook no registrado'}". Por favor activa el switch "Active" (arriba a la derecha) en el editor de n8n.`,
        ticketNumber: sale.ticketNumber,
        rawResponse: data,
      };
    }

    if (httpStatus >= 400) {
      return {
        success: false,
        status: 'error',
        message: `HTTP ${httpStatus}: ${data?.message || JSON.stringify(data) || 'Error devuelto por n8n'}`,
        ticketNumber: sale.ticketNumber,
        rawResponse: data,
      };
    }

    // Check if n8n returned an error status in JSON body
    if (data && data.status === 'error') {
      return {
        success: false,
        status: 'error',
        message: data.message || 'El webhook n8n reportó un error al procesar el voucher.',
        ticketNumber: data.ticketNumber || sale.ticketNumber,
        rawResponse: data,
      };
    }

    return {
      success: true,
      status: 'sent',
      ticketNumber: data?.ticketNumber || sale.ticketNumber,
      message: '¡Voucher procesado y enviado con éxito a WhatsApp!',
      rawResponse: data,
    };
  } catch (err: any) {
    console.error('Error invoking n8n webhook via proxy:', err);
    return {
      success: false,
      status: 'network_error',
      message: err.message || 'No se pudo conectar con el servidor n8n.',
    };
  }
}
