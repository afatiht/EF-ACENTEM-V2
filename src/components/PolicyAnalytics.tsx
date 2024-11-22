import React, { useState } from 'react';
import { LineChart, Search } from 'lucide-react';
import { analyzePolicy } from '../lib/gemini';
import type { Policy, Customer, Vehicle } from '../types';

interface Props {
  policies: Policy[];
  customers: Customer[];
  vehicles: Vehicle[];
}

export default function PolicyAnalytics({ policies, customers, vehicles }: Props) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const formatPolicyData = () => {
    return policies.map(policy => {
      const customer = customers.find(c => c.id === policy.customerId);
      const vehicle = vehicles.find(v => v.id === policy.vehicleId);
      
      return {
        policyNumber: policy.policyNumber,
        customer: `${customer?.firstName} ${customer?.lastName}`,
        vehicle: `${vehicle?.plate} - ${vehicle?.brand} ${vehicle?.model}`,
        type: policy.type === 'traffic' ? 'Trafik Sigortası' : 'Kasko',
        startDate: new Date(policy.startDate).toLocaleDateString('tr-TR'),
        endDate: new Date(policy.endDate).toLocaleDateString('tr-TR'),
        price: policy.price
      };
    });
  };

  const handleAnalysis = async () => {
    try {
      setLoading(true);
      const policyData = formatPolicyData();
      const prompt = `Sigorta poliçe verileri: ${JSON.stringify(policyData, null, 2)}
      
      Soru: ${query}
      
      Lütfen bu verileri analiz ederek soruyu yanıtlar mısın? Yanıtı Türkçe olarak ver.`;
      
      const result = await analyzePolicy(prompt);
      setAnalysis(result);
    } catch (error) {
      setAnalysis('Üzgünüm, analiz sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <LineChart className="w-6 h-6 text-blue-600" />
        Poliçe Analizi
      </h2>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örnek: En yüksek primli 3 poliçeyi listele"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          onClick={handleAnalysis}
          disabled={loading || !query.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analiz Ediliyor...
            </span>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analiz Et
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{analysis}</pre>
        </div>
      )}
    </div>
  );
}