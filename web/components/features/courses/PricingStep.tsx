"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

interface Props {
  defaultPrice?: number;
  expertise?: string;
  onSubmit: (priceCents: number) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function PricingStep({ defaultPrice, expertise, onSubmit, onBack, isLoading }: Props) {
  const [price, setPrice] = useState(defaultPrice ? String(defaultPrice / 100) : "197");
  const priceNum = parseFloat(price) || 0;
  const platformFee = Math.round(priceNum * 0.1 * 100) / 100;
  const youEarn = Math.round((priceNum - platformFee) * 100) / 100;

  function handleSubmit() {
    if (priceNum <= 0) return;
    onSubmit(Math.round(priceNum * 100));
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Course Price (USD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="1"
            step="1"
            className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="197"
          />
        </div>
        {expertise && (
          <p className="mt-1.5 text-xs text-slate-500">
            Suggested for {expertise} courses: <strong>$97 – $497</strong>
          </p>
        )}
      </div>

      {priceNum > 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Earnings estimate</p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Course price</span>
            <span className="text-slate-700">${priceNum.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Platform fee (10%)</span>
            <span className="text-slate-500">-${platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-teal-200 pt-2">
            <span className="text-slate-700">You earn per enrollment</span>
            <span className="text-teal-700">${youEarn.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={priceNum <= 0 || isLoading}
          className="flex-1 bg-[#0F766E] text-white py-3 rounded-lg font-medium hover:bg-[#0D6D65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating sales page..." : "Generate my sales page ✨"}
        </button>
      </div>
    </div>
  );
}
