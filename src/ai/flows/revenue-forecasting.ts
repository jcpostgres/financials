// Revenue forecasting flow using Genkit to analyze sales data and predict future revenue.

'use server';

/**
 * @fileOverview An AI-powered tool that analyzes historical sales data and market trends to forecast future revenue, so admins can make informed decisions about inventory and staffing.
 *
 * - revenueForecast - A function that handles the revenue forecast process.
 * - RevenueForecastInput - The input type for the revenueForecast function.
 * - RevenueForecastOutput - The return type for the revenueForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevenueForecastInputSchema = z.object({
  historicalData: z.string().describe('Historical sales data in JSON format.'),
  marketTrends: z.string().describe('Current market trends and seasonality in JSON format.'),
});

export type RevenueForecastInput = z.infer<typeof RevenueForecastInputSchema>;

const RevenueForecastOutputSchema = z.object({
  revenueForecast: z.string().describe('Forecasted revenue for the next month.'),
  suggestedInventoryAdjustment: z.string().describe('Suggested inventory adjustments based on the forecast.'),
  suggestedStaffingAdjustment: z.string().describe('Suggested staffing adjustments based on the forecast.'),
});

export type RevenueForecastOutput = z.infer<typeof RevenueForecastOutputSchema>;

export async function revenueForecast(input: RevenueForecastInput): Promise<RevenueForecastOutput> {
  return revenueForecastFlow(input);
}

const revenueForecastPrompt = ai.definePrompt({
  name: 'revenueForecastPrompt',
  input: {schema: RevenueForecastInputSchema},
  output: {schema: RevenueForecastOutputSchema},
  prompt: `You are a financial analyst specializing in revenue forecasting for small businesses. Analyze the provided historical sales data and market trends to forecast the revenue for the next month, suggest inventory adjustments, and staffing adjustments.

Historical Sales Data: {{{historicalData}}}
Market Trends: {{{marketTrends}}}

Provide the revenue forecast, suggested inventory adjustments, and suggested staffing adjustments in a concise manner.`,
});

const revenueForecastFlow = ai.defineFlow(
  {
    name: 'revenueForecastFlow',
    inputSchema: RevenueForecastInputSchema,
    outputSchema: RevenueForecastOutputSchema,
  },
  async input => {
    const {output} = await revenueForecastPrompt(input);
    return output!;
  }
);
