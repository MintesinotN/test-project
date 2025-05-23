'use client';

import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

// Define types for Conversion model
interface Conversion {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  createdAt: Date;
}

// Define types for conversion API response
interface ConvertResponse {
  result: number;
  rate: number;
}

// Define types for history API response
interface HistoryResponse {
  data: Conversion[];
}

export default function Home() {
  const [amount, setAmount] = useState<string>(''); // Input is string from form
  const [currency, setCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<Conversion[]>([]);
  const [error, setError] = useState<string>('');

  const currencies: string[] = ['EUR', 'GBP', 'JPY', 'CAD'];

  const handleConvert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (!currencies.includes(currency)) {
      setError('Invalid currency selected');
      return;
    }

    try {
      const response: AxiosResponse<ConvertResponse> = await axios.post('/api', {
        amount: parsedAmount,
        toCurrency: currency,
      });
      setResult(response.data.result);
      fetchHistory();
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.error || 'Failed to convert currency');
    }
  };

  const fetchHistory = async () => {
    try {
      const response: AxiosResponse<HistoryResponse> = await axios.get('/api');
      if (Array.isArray(response.data.data)) {
        setHistory(response.data.data);
      } else {
        console.error('History response is not an array:', response.data);
        setError('Invalid history data');
      }
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError('Failed to fetch history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-5 text-center">
      <h1 className="text-3xl font-bold mb-6">Currency Converter</h1>
      <form onSubmit={handleConvert} className="flex gap-4 mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          placeholder="Enter USD amount"
          required
          min="0"
          step="0.01"
          className="p-2 text-lg border border-gray-300 rounded"
        />
        <select
          value={currency}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
          className="p-2 text-lg border border-gray-300 rounded"
        >
          {currencies.map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>
        <button type="submit" className="p-2 text-lg bg-blue-500 text-white rounded hover:bg-blue-600">
          Convert
        </button>
      </form>

      {error && <p className="text-red-500 text-lg mb-4">{error}</p>}
      {result !== null && (
        <p className="text-green-500 text-lg mb-4">
          {amount} USD = {result.toFixed(2)} {currency}
        </p>
      )}

      <h2 className="text-2xl font-semibold mb-4">Conversion History</h2>
      <ul className="list-none p-0">
        {history.map((item) => (
          <li key={item.id} className="p-2 border-b border-gray-200">
            {item.amount} USD to {item.toCurrency} = {item.result.toFixed(2)} (
            {new Date(item.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}