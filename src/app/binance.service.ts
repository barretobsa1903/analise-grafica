import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  constructor() {}

  async getBinanceData(symbol: string, interval: string, limit = 100) {
    const url = `https://api.binance.com/api/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados da Binance:', error);
      throw error;
    }
  }
}
