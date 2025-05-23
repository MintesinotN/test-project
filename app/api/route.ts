import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { data } from '../data/data';

const prisma = new PrismaClient();

// Define types for the request body
interface ConvertRequestBody {
  amount: number;
  toCurrency: string;
}

// Define types for the exchange rate API response
interface ExchangeRateResponse {
  result: string;
  conversion_rates: Record<string, number>;
}

interface Conversion {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  createdAt: Date;
}

// Define API response type
interface HistoryResponse {
  data?: Conversion[];
  error?: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log('POST /api received:', body, 'Type of amount:', typeof body.amount); // Log body and amount type

  const { amount, toCurrency } = body as ConvertRequestBody;

  // Parse amount to number
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Validate inputs
  if (typeof parsedAmount !== 'number' || isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error('Invalid amount:', amount, 'Parsed:', parsedAmount);
    return NextResponse.json({ error: 'Amount must be a valid positive number' }, { status: 400 });
  }
  const validCurrencies = ['EUR', 'GBP', 'JPY', 'CAD'] as const;
  type Currency = typeof validCurrencies[number];
  if (typeof toCurrency !== 'string' || !validCurrencies.includes(toCurrency as Currency)) {
    console.error('Invalid currency:', toCurrency);
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
  }

  try {

    const response: AxiosResponse<ExchangeRateResponse> = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    );
    
    // Use mocked data
    // const response: { data: ExchangeRateResponse } = { data };

    // Validate API response
    console.log('ExchangeRate-API response:', response.data); // Log response
    if (!response.data || !response.data.conversion_rates) {
      console.error('Invalid API response:', response.data);
      return NextResponse.json({ error: 'Invalid exchange rate data' }, { status: 500 });
    }

    const rates = response.data.conversion_rates;
    const rate = rates[toCurrency as Currency]; // Type assertion

    if (!rate || typeof rate !== 'number') {
      console.error('Unsupported currency rate:', toCurrency, rate);
      return NextResponse.json({ error: `Currency ${toCurrency} not supported by API` }, { status: 400 });
    }

    const result = parsedAmount * rate;

    // Store conversion in database
    await prisma.conversion.create({
      data: {
        fromCurrency: 'USD',
        toCurrency,
        amount: parsedAmount,
        result,
      },
    });

    return NextResponse.json({ result, rate }, { status: 200 });
  } catch (error: any) {
    console.error('Conversion error:', error.message, error.response?.data);
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const history: Conversion[] = await prisma.conversion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ data: history }, {status: 200});
  } catch (error: any) {
    console.error('History error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, {status: 500});
  } finally {
    await prisma.$disconnect();
  }
}