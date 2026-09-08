import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { CashShift, Sale, CashDenominationCount, ShiftCashMovement } from '../../types';
import {
  X,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Coins,
  CreditCard,
  Smartphone,
  Printer,
  ShieldCheck,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Calculator,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CloseShiftModalProps {
  shift: CashShift;
  sales: Sale[];
  onClose: () => void;
  onSuccess: (closedShift: CashShift) => void;
  mode?: 'close' | 'surprise'; // 'close' closes the shift, 'surprise' records a blind audit without closing
}

interface DenominationItem {
  id: keyof CashDenominationCount;
  label: string;
  value: number;
  isCoin?: boolean;
}

const DENOMINATIONS: DenominationItem[] = [
  { id: 'bills200', label: 'Billetes S/ 200', value: 200 },
  { id: 'bills100', label: 'Billetes S/ 100', value: 100 },
  { id: 'bills50', label: 'Billetes S/ 50', value: 50 },
  { id: 'bills20', label: 'Billetes S/ 20', value: 20 },
  { id: 'bills10', label: 'Billetes S/ 10', value: 10 },
  { id: 'coins5', label: 'Monedas S/ 5.00', value: 5, isCoin: true },
  { id: 'coins2', label: 'Monedas S/ 2.00', value: 2, isCoin: true },
  { id: 'coins1', label: 'Monedas S/ 1.00', value: 1, isCoin: true },
  { id: 'coins050', label: 'Monedas S/ 0.50', value: 0.5, isCoin: true },
  { id: 'coins020', label: 'Monedas S/ 0.20', value: 0.2, isCoin: true },
  { id: 'coins010', label: 'Monedas S/ 0.10', value: 0.1, isCoin: true },
];

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  shift,
  sales,
  onClose,
  onSuccess,
  mode = 'close',
}) => {
  const { closeCashShift, recordBlindAudit, addCashMovement, currentUser } = usePos();

  // Shift financial calculations
  const shiftSales = useMemo(() => sales.filter((s) => s.shiftId === shift.id), [sales, shift.id]);

  const cashSalesTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => {
      const cashPayments = s.payments.filter((p) => p.method === 'cash');
      return sum + cashPayments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);
  }, [shiftSales]);

  const cardSalesTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => {
      const cardPayments = s.payments.filter((p) => p.method === 'card');
      return sum + cardPayments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);
  }, [shiftSales]);

  const walletSalesTotal = useMemo(() => {
    return shiftSales.reduce((sum, s) => {
      const walletPayments = s.payments.filter((p) => p.method === 'wallet');
      return sum + walletPayments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0);
  }, [shiftSales]);

  // Cash movements (inflows and outflows in petty cash)
  const shiftMovements = shift.movements || [];
  const totalInflows = shiftMovements
    .filter((m) => m.type === 'inflow')
    .reduce((sum, m) => sum + m.amount, 0);
  const totalOutflows = shiftMovements
    .filter((m) => m.type === 'outflow')
    .reduce((sum, m) => sum + m.amount, 0);

  const initialCash = shift.initialCash;
  const expectedCash = Math.round((initialCash + cashSalesTotal + totalInflows - totalOutflows) * 100) / 100;

  // --- STEP STATE ---
  // Step 1: Blind physical cash count (cajero counts without seeing system numbers)
  // Step 2: Audit revelation & Reconciliation (comparison, discrepancy analysis, supervisor validation)
  const [currentStep, setCurrentStep] = useState<'count' | 'reconciliation'>('count');

  // Input Method: 'breakdown' (denominations) vs 'direct' (quick total)
  const [inputMethod, setInputMethod] = useState<'breakdown' | 'direct'>('breakdown');

  // Denominations counter state
  const [denominations, setDenominations] = useState<CashDenominationCount>({
    bills200: 0,
    bills100: 0,
    bills50: 0,
    bills20: 0,
    bills10: 0,
    coins5: 0,
    coins2: 0,
    coins1: 0,
    coins050: 0,
    coins020: 0,
    coins010: 0,
  });

  // Direct manual cash amount
  const [directCashAmount, setDirectCashAmount] = useState<string>('');

  // Auxiliary non-cash counts
  const [cardVouchersCount, setCardVouchersCount] = useState<string>('');
  const [cardVouchersTotal, setCardVouchersTotal] = useState<string>('');
  const [walletCount, setWalletCount] = useState<string>('');
  const [walletTotal, setWalletTotal] = useState<string>('');

  // Cashier sworn declaration
  const [swornDeclaration, setSwornDeclaration] = useState(false);

  // Quick petty cash movement drawer inside modal
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');

  // Step 2 reconciliation states
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('Cuadre conforme verificado.');
  const [discrepancyCategory, setDiscrepancyCategory] = useState<string>('normal');
  const [supervisorName, setSupervisorName] = useState<string>(
    currentUser?.role === 'admin' ? currentUser.name : ''
  );
  const [supervisorApproved, setSupervisorApproved] = useState(currentUser?.role === 'admin');
  const [notes, setNotes] = useState<string>('Arqueo ciego de caja completado conforme a política de cero pérdidas.');

  // Calculate total cash counted based on selected method
  const calculatedBreakdownTotal = useMemo(() => {
    let sum = 0;
    DENOMINATIONS.forEach((d) => {
      const qty = denominations[d.id] || 0;
      sum += qty * d.value;
    });
    return Math.round(sum * 100) / 100;
  }, [denominations]);

  const finalDeclaredCash = useMemo(() => {
    if (inputMethod === 'breakdown') {
      return calculatedBreakdownTotal;
    }
    const parsed = parseFloat(directCashAmount);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }, [inputMethod, calculatedBreakdownTotal, directCashAmount]);

  // Difference calculated in step 2
  const difference = Math.round((finalDeclaredCash - expectedCash) * 100) / 100;
  const auditResult: 'balanced' | 'surplus' | 'shortage' =
    Math.abs(difference) < 0.05 ? 'balanced' : difference > 0 ? 'surplus' : 'shortage';

  const handleDenominationChange = (id: keyof CashDenominationCount, value: number) => {
    setDenominations((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.floor(value) || 0),
    }));
  };

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0 || !expenseReason.trim()) return;

    addCashMovement(shift.id, {
      type: 'outflow',
      amount: amt,
      reason: expenseReason.trim(),
      category: 'gasto_menor',
    });

    setExpenseAmount('');
    setExpenseReason('');
    setShowQuickExpense(false);
  };

  const handleProceedToReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swornDeclaration) return;
    if (inputMethod === 'direct' && !directCashAmount) return;

    // Set default discrepancy reason based on result
    if (Math.abs(difference) >= 0.05) {
      if (difference < 0) {
        setDiscrepancyReason('Faltante detectado en gaveta. Requiere revisión de transacciones y vueltos.');
        setDiscrepancyCategory('error_vuelto');
      } else {
        setDiscrepancyReason('Sobrante detectado en gaveta. Se retiene para custodia administrativa.');
        setDiscrepancyCategory('sobrante_custodia');
      }
    }

    setCurrentStep('reconciliation');
  };

  const handleFinalSubmit = () => {
    const details = {
      denominations: inputMethod === 'breakdown' ? denominations : {},
      declaredCardVouchers: parseFloat(cardVouchersTotal) || 0,
      declaredCardCount: parseInt(cardVouchersCount) || 0,
      declaredWalletAmount: parseFloat(walletTotal) || 0,
      declaredWalletCount: parseInt(walletCount) || 0,
      discrepancyReason: `${discrepancyCategory}: ${discrepancyReason}`,
      supervisorName: supervisorName || (currentUser?.role === 'admin' ? currentUser.name : 'Supervisor'),
      supervisorApproved: true,
      auditResult,
    };

    if (mode === 'surprise') {
      // Record surprise audit without closing the shift
      recordBlindAudit(shift.id, {
        auditType: 'surprise',
        cashierId: shift.cashierId,
        cashierName: shift.cashierName,
        supervisorName: details.supervisorName,
        denominations: details.denominations,
        declaredCash: finalDeclaredCash,
        declaredCardVouchers: details.declaredCardVouchers,
        declaredCardCount: details.declaredCardCount,
        declaredWalletAmount: details.declaredWalletAmount,
        declaredWalletCount: details.declaredWalletCount,
        expectedCash,
        difference,
        auditResult,
        discrepancyReason: details.discrepancyReason,
        supervisorApproved: true,
        notes,
      });
      onSuccess(shift);
      onClose();
    } else {
      // Final close of the shift
      const closed = closeCashShift(shift.id, finalDeclaredCash, notes, details);
      onSuccess(closed);
    }
  };

  const handlePrintAuditReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                  {mode === 'surprise' ? 'Arqueo Ciego Sorpresa' : 'Arqueo Ciego de Cierre de Caja'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-neutral-950">
                  Anti-Robo & Cero Pérdidas
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Turno: <span className="text-white font-mono font-bold">{shift.shiftNumber}</span> • Cajero:{' '}
                <span className="text-white font-semibold">{shift.cashierName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-neutral-800">
          {/* STEP 1: CONTEO FÍSICO CIEGO */}
          {currentStep === 'count' && (
            <form onSubmit={handleProceedToReconciliation} className="space-y-5">
              {/* Anti-Theft Policy Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <div className="p-2 bg-emerald-500 text-neutral-950 rounded-xl shrink-0 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h3 className="font-bold text-emerald-950 text-sm">
                    Protocolo de Conteo Físico a Ciegas
                  </h3>
                  <p className="text-emerald-800 leading-relaxed">
                    Por seguridad anti-robo y política de <strong>cero pérdidas</strong>, los montos teóricos calculados por el sistema están deliberadamente ocultos. Ingresa con exactitud el dinero físico real encontrado en la gaveta.
                  </p>
                </div>
              </div>

              {/* Input Method Selector */}
              <div className="flex items-center justify-between bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
                <span className="text-xs font-bold text-neutral-700 pl-2">
                  Método de Conteo Físico:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setInputMethod('breakdown')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inputMethod === 'breakdown'
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Desglose por Billetes y Monedas (Recomendado)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMethod('direct')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inputMethod === 'direct'
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Monto Total Directo</span>
                  </button>
                </div>
              </div>

              {/* METHOD A: DENOMINATIONS BREAKDOWN */}
              {inputMethod === 'breakdown' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      Conteo de Billetes y Monedas (PEN)
                    </h4>
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      Multiplicador automático
                    </span>
                  </div>

                  {/* Denominations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DENOMINATIONS.map((d) => {
                      const qty = denominations[d.id] || 0;
                      const subtotal = qty * d.value;

                      return (
                        <div
                          key={d.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            qty > 0
                              ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30'
                              : 'bg-neutral-50 border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                d.isCoin
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {d.isCoin ? 'S/' : 'B/.'}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-neutral-900 block truncate">
                                {d.label}
                              </span>
                              <span className="text-[11px] font-mono text-neutral-500">
                                Subtotal: <strong className="text-neutral-900">S/ {subtotal.toFixed(2)}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Stepper / Input */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDenominationChange(d.id, qty - 1)}
                              className="w-7 h-7 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold flex items-center justify-center text-sm cursor-pointer active:scale-95"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty === 0 ? '' : qty}
                              placeholder="0"
                              onChange={(e) =>
                                handleDenominationChange(d.id, parseInt(e.target.value) || 0)
                              }
                              className="w-12 h-7 text-center bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-950 font-mono focus:outline-none focus:border-neutral-950"
                            />
                            <button
                              type="button"
                              onClick={() => handleDenominationChange(d.id, qty + 1)}
                              className="w-7 h-7 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold flex items-center justify-center text-sm cursor-pointer active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Running Cash Total Banner */}
                  <div className="p-4 bg-neutral-950 text-white rounded-2xl flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500 text-neutral-950 rounded-xl font-bold">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-neutral-400 uppercase font-bold block">
                          Efectivo Físico Declarado
                        </span>
                        <span className="text-xs text-neutral-300">
                          Suma automática de billetes y monedas
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                        S/ {calculatedBreakdownTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* METHOD B: DIRECT TOTAL INPUT */
                <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">
                    Efectivo Total Contado en Gaveta (PEN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-neutral-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      autoFocus
                      placeholder="0.00"
                      value={directCashAmount}
                      onChange={(e) => setDirectCashAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-2xl font-black text-neutral-950 font-mono focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    Digita el total exacto tras haber sumado físicamente todo el dinero en efectivo.
                  </p>
                </div>
              )}

              {/* AUXILIARY DECLARATIONS: VOUCHERS AND DIGITAL WALLETS */}
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Declaración de Comprobantes Electrónicos (Auditoría Cruzada)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Card Vouchers */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      Vouchers Físicos de Tarjeta (POS)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase block">N° Vouchers</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={cardVouchersCount}
                          onChange={(e) => setCardVouchersCount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase block">Total S/</label>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="0.00"
                          value={cardVouchersTotal}
                          onChange={(e) => setCardVouchersTotal(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yape / Plin */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                      Comprobantes Yape / Plin Verificados
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase block">N° Operaciones</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={walletCount}
                          onChange={(e) => setWalletCount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase block">Total S/</label>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="0.00"
                          value={walletTotal}
                          onChange={(e) => setWalletTotal(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK GASTO DRAWER (Last minute expenses) */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowQuickExpense(!showQuickExpense)}
                  className="w-full p-3.5 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-700 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-500" />
                    ¿Hubo algún gasto menor o retiro de caja no registrado?
                  </span>
                  {showQuickExpense ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showQuickExpense && (
                  <div className="p-4 bg-white border-t border-neutral-200 space-y-3">
                    <p className="text-[11px] text-neutral-500">
                      Si pagaste a un proveedor, delivery o compraste útiles de caja chica con efectivo de la gaveta, regístralo aquí antes de validar el arqueo:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <label className="text-[10px] font-bold text-neutral-600 block mb-1">Monto S/</label>
                        <input
                          type="number"
                          step="0.10"
                          placeholder="0.00"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-neutral-600 block mb-1">Motivo / Concepto</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Ej: Pago de pasaje delivery o bolsas"
                            value={expenseReason}
                            onChange={(e) => setExpenseReason(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleQuickAddExpense}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
                          >
                            Registrar Salida
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CASHIER SWORN DECLARATION */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={swornDeclaration}
                    onChange={(e) => setSwornDeclaration(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-neutral-950 focus:ring-neutral-950 border-neutral-300 cursor-pointer"
                  />
                  <span className="text-xs text-amber-950 font-medium leading-relaxed">
                    <strong>Declaración de Conformidad:</strong> Declaro bajo juramento que el conteo físico ingresado corresponde con total veracidad y exactitud al dinero y comprobantes reales existentes en la gaveta de caja al momento de esta auditoría.
                  </span>
                </label>
              </div>

              {/* ACTION: PROCEED TO RECONCILIATION */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!swornDeclaration || (inputMethod === 'direct' && !directCashAmount)}
                  className="flex-2 py-3 px-4 bg-neutral-950 hover:bg-black disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>REGISTRAR CONTEO FÍSICO Y AUDITAR CUADRE</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: RECONCILIATION & AUDIT REVELATION */}
          {currentStep === 'reconciliation' && (
            <div className="space-y-5">
              {/* STATUS BANNER */}
              <div
                className={`p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
                  auditResult === 'balanced'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : auditResult === 'surplus'
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    auditResult === 'balanced'
                      ? 'bg-emerald-600 text-white'
                      : auditResult === 'surplus'
                      ? 'bg-blue-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {auditResult === 'balanced' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : auditResult === 'surplus' ? (
                    <ArrowDownRight className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base uppercase tracking-tight">
                      {auditResult === 'balanced'
                        ? '¡Cuadre Exacto! Cero Pérdidas'
                        : auditResult === 'surplus'
                        ? 'Sobrante en Gaveta de Caja'
                        : '¡Alerta Anti-Robo! Faltante en Caja'}
                    </h3>
                    <span className="font-mono font-black text-lg">
                      {auditResult === 'balanced'
                        ? 'S/ 0.00'
                        : `${difference > 0 ? '+ S/' : '- S/'} ${Math.abs(difference).toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {auditResult === 'balanced'
                      ? 'El dinero físico contado en la gaveta coincide exactamente con el saldo teórico registrado por el sistema.'
                      : auditResult === 'surplus'
                      ? 'Se ha encontrado más efectivo del registrado. Esto suele indicar cobro duplicado o vuelto no reclamado. El sobrante se retiene y documenta para custodia.'
                      : 'Existe una discrepancia negativa respecto a las ventas del sistema. Se activa el protocolo de auditoría de cero pérdidas para documentar el motivo.'}
                  </p>
                </div>
              </div>

              {/* DETAILED FINANCIAL AUDIT COMPARISON */}
              <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 font-sans">
                  <span className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
                    Auditoría Comparativa de Efectivo
                  </span>
                  <span className="text-[10px] text-neutral-400">Arqueo Ciego Registrado</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-neutral-400">
                    <span className="font-sans">Fondo Inicial de Apertura:</span>
                    <span className="text-white">S/ {initialCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span className="font-sans">(+) Ventas Cobradas en Efectivo:</span>
                    <span className="text-emerald-400">+ S/ {cashSalesTotal.toFixed(2)}</span>
                  </div>
                  {totalInflows > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span className="font-sans">(+) Entradas / Sencillo en Caja:</span>
                      <span className="text-emerald-400">+ S/ {totalInflows.toFixed(2)}</span>
                    </div>
                  )}
                  {totalOutflows > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span className="font-sans">(-) Salidas / Gastos de Caja Chica:</span>
                      <span className="text-rose-400">- S/ {totalOutflows.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-neutral-200 text-sm font-bold">
                    <span className="font-sans">(=) Efectivo Teórico Esperado por Sistema:</span>
                    <span className="text-emerald-400 text-base">S/ {expectedCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 bg-neutral-800/80 px-3 rounded-xl text-neutral-100 text-sm font-bold">
                    <span className="font-sans">Efectivo Físico Real Declarado:</span>
                    <span className="text-white text-base">S/ {finalDeclaredCash.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between items-center pt-2 text-sm font-black ${
                      auditResult === 'balanced'
                        ? 'text-emerald-400'
                        : auditResult === 'surplus'
                        ? 'text-blue-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <span className="font-sans">Diferencia de Cuadre:</span>
                    <span>
                      {auditResult === 'balanced'
                        ? 'S/ 0.00 (EXACTO)'
                        : `${difference > 0 ? '+ S/' : '- S/'} ${Math.abs(difference).toFixed(2)} (${
                            difference > 0 ? 'SOBRANTE' : 'FALTANTE'
                          })`}
                    </span>
                  </div>
                </div>
              </div>

              {/* DISCREPANCY JUSTIFICATION (Required if difference !== 0) */}
              {Math.abs(difference) >= 0.05 && (
                <div className="p-4 bg-white rounded-2xl border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs uppercase">
                      Justificación Obligatoria de Descuadre
                    </h4>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Causal Identificada *
                    </label>
                    <select
                      value={discrepancyCategory}
                      onChange={(e) => setDiscrepancyCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                    >
                      {difference < 0 ? (
                        <>
                          <option value="error_vuelto">Error involuntario en entrega de vuelto al cliente</option>
                          <option value="billete_falso">Billete o moneda falsa detectada y retirada</option>
                          <option value="gasto_no_anotado">Gasto menor de caja no anotado a tiempo</option>
                          <option value="diferencia_asumida_cajero">Diferencia asumida y repuesta por el cajero</option>
                          <option value="en_investigacion">En proceso de investigación con cámaras de seguridad</option>
                          <option value="otro">Otro motivo</option>
                        </>
                      ) : (
                        <>
                          <option value="sobrante_custodia">Vuelto no reclamado por cliente (retenido en custodia)</option>
                          <option value="cobro_duplicado">Posible cobro duplicado pendiente de reclamo</option>
                          <option value="ingreso_no_registrado">Ingreso de sencillo adicional no anotado</option>
                          <option value="otro">Otro motivo</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Explicación Detallada del Cajero *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={discrepancyReason}
                      onChange={(e) => setDiscrepancyReason(e.target.value)}
                      placeholder="Describe qué ocurrió durante el turno para que quede en el acta de auditoría..."
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* SUPERVISOR APPROVAL & SIGNATURE */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Validación y Firma de Supervisor / Administrador
                  </h4>
                  <span className="text-[11px] text-neutral-500">Auditoría inmutable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-600 block mb-1">
                      Nombre del Supervisor / Responsable *
                    </label>
                    <input
                      type="text"
                      required
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="Ej: Administrador General"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-600 block mb-1">
                      Notas Finales de Auditoría
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('count')}
                  className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  ← Modificar Conteo
                </button>
                <button
                  type="button"
                  onClick={handlePrintAuditReceipt}
                  className="py-3 px-4 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Imprimir Acta de Arqueo</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {mode === 'surprise'
                      ? 'GUARDAR ARQUEO SORPRESA (CONTINUAR TURNO)'
                      : 'CONFIRMAR Y CERRAR TURNO DEFINITIVO'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
