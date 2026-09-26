import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Layers,
  Calendar,
  Percent,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { debtService } from '../services';
import { formatINR } from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal';

export default function DebtsPage() {
  const [debtsSummary, setDebtsSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    type: 'Personal Loan',
    principal: 100000,
    outstanding: 75000,
    interest_rate: 11.5,
    emi: 4500,
    due_date: 5,
    remaining_months: 18
  };
  const [formData, setFormData] = useState(initialForm);

  const loanTypes = [
    'Personal Loan',
    'Home Loan',
    'Education Loan',
    'Vehicle Loan',
    'Credit Card',
    'Other'
  ];

  const fetchDebts = async () => {
    try {
      setIsLoading(true);
      const data = await debtService.getDebts();
      setDebtsSummary(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load debts list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleOpenAdd = () => {
    setEditingDebt(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      type: debt.type,
      principal: debt.principal,
      outstanding: debt.outstanding,
      interest_rate: debt.interest_rate,
      emi: debt.emi,
      due_date: debt.due_date,
      remaining_months: debt.remaining_months
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        principal: Number(formData.principal),
        outstanding: Number(formData.outstanding),
        interest_rate: Number(formData.interest_rate),
        emi: Number(formData.emi),
        due_date: Number(formData.due_date),
        remaining_months: Number(formData.remaining_months)
      };

      if (editingDebt) {
        await debtService.updateDebt(editingDebt.id, payload);
      } else {
        await debtService.createDebt(payload);
      }

      setShowModal(false);
      await fetchDebts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to save debt record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsSubmitting(true);
      await debtService.deleteDebt(deletingId);
      setDeletingId(null);
      await fetchDebts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Debt & Loan Portfolio
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track active borrowings, monthly EMI drains, due dates, and amortization progress.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt / Loan</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Outstanding */}
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Outstanding Debt</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {formatINR(debtsSummary?.total_outstanding || 0)}
          </p>
          <span className="text-[11px] text-slate-400 block">Across all active accounts</span>
        </div>

        {/* Monthly EMI Burden */}
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Monthly EMI Outflow</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {formatINR(debtsSummary?.total_monthly_emi || 0)}
          </p>
          <span className="text-[11px] text-slate-400 block">Recurring monthly commitment</span>
        </div>

        {/* Total Accounts */}
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Active Accounts Count</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
            {debtsSummary?.debts_count || 0}
          </p>
          <span className="text-[11px] text-slate-400 block">Loans & credit cards</span>
        </div>

      </div>

      {/* Debts Grid / Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Active Borrowings
          </h3>
          <span className="text-xs text-slate-400">
            {debtsSummary?.debts_count || 0} Records
          </span>
        </div>

        {debtsSummary?.debts && debtsSummary.debts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debtsSummary.debts.map((d) => {
              const principal = Math.max(d.principal, d.outstanding, 1);
              const paidOff = Math.max(0, principal - d.outstanding);
              const paidPct = Math.min(100, Math.round((paidOff / principal) * 100));

              return (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 inline-block mb-1">
                        {d.type}
                      </span>
                      <h4 className="text-base font-bold text-white truncate max-w-[180px]">{d.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        title="Edit Debt"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(d.id)}
                        title="Delete Debt"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-800/80">
                    <div>
                      <p className="text-slate-400">Outstanding</p>
                      <p className="font-bold text-white font-mono mt-0.5">{formatINR(d.outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Monthly EMI</p>
                      <p className="font-bold text-amber-400 font-mono mt-0.5">{formatINR(d.emi)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Interest Rate</p>
                      <p className="font-semibold text-slate-200 mt-0.5">{d.interest_rate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Due Date</p>
                      <p className="font-semibold text-slate-200 mt-0.5">{d.due_date}th of month</p>
                    </div>
                  </div>

                  {/* Payoff Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Principal Repaid: {paidPct}%</span>
                      {d.remaining_months > 0 && <span>{d.remaining_months} mos left</span>}
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No Debts Added Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your loans and credit cards to track aggregate obligations, DTI burden, and repayment schedules.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" /> Add First Debt
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Debt Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                {editingDebt ? 'Edit Debt Record' : 'Add New Debt Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Debt / Loan Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. HDFC Home Loan, ICICI Coral Card"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {loanTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Original Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Outstanding (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.outstanding}
                    onChange={(e) => setFormData({ ...formData, outstanding: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.emi}
                    onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Monthly Due Date (Day 1 - 31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Remaining Months
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.remaining_months}
                    onChange={(e) => setFormData({ ...formData, remaining_months: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : editingDebt ? 'Save Changes' : 'Add Debt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Debt Account"
        message="Are you sure you want to remove this debt record? Your total outstanding debt and monthly EMI totals will be automatically recalculated."
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
        isLoading={isSubmitting}
      />

    </div>
  );
}
