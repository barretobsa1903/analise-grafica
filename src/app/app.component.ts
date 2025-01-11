import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { InsideBarSetup, Setup123Compra } from './Setups/setups'; // Caminho relativo para o arquivo
import { Setup } from '../Interface/setup'; // Caminho relativo para o arquivo
import { SetupDTO } from './objetos/setupsDTO';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SetupType } from './types/type';


type MovingAverage = {
  data: LineData[];
  period: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    CommonModule,
  ],
})

export class AppComponent implements OnInit, OnDestroy {

  private chart!: IChartApi;
  searchControl = new FormControl('');
  options: SetupDTO[] = [{ nome: 'insideBar', descricao: 'Insidebar' }, { nome: 'setup123compra', descricao: '123 de compra' }];
  filteredOptions: SetupDTO[] = [];
  candlestickSeries: any; // Declara como atributo da classe
  dataBinance: any;

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
    const container = this.elRef.nativeElement.querySelector('#chart-container');

    // Criar o gráfico com configurações gerais
    this.chart = createChart(container, {
      width: container.offsetWidth,
      height: 400,
      layout: {
        background: { color: '#000000' },
        textColor: '#000000',
      },
      grid: {
        vertLines: { color: '#000000' },
        horzLines: { color: '#000000' },
      },
      timeScale: { borderColor: '#cccccc' },
    });

    // Configurar e adicionar a série de velas (Candlestick)
    this.candlestickSeries = this.chart.addCandlestickSeries({
      priceScaleId: 'right', // Define a escala de preço no lado direito
      upColor: '#4caf50',
      downColor: '#f44336',
      borderVisible: false,
      wickUpColor: '#4caf50',
      wickDownColor: '#f44336',
    });

    // Obter dados da Binance e adicionar ao gráfico
    this.fetchBinanceData('BTCUSDT', '4h').then((data) => {
      this.candlestickSeries.setData(data);
      this.dataBinance = [...data];
      // Calcular as médias móveis e adicionar as linhas ao gráfico

    });

    // Filtro reativo
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterOptions(value || ''))
      )
      .subscribe(filtered => (this.filteredOptions = filtered));
  }

  private filterOptions(value: string): SetupDTO[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option =>
      option.descricao.toLowerCase().includes(filterValue)
    );
  }

  // Função para buscar dados da Binance (exemplo: BTC/USDT em velas de 1 dia)
  private async fetchBinanceData(symbol: string, interval: string): Promise<CandlestickData[]> {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
    const response = await fetch(url);
    const data = await response.json();

    return data.map((item: any) => {
      return {
        time: item[0], // Mantém o timestamp em milissegundos
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
      };
    });
  }
  // Função para calcular a média móvel similar ao TradingView
  private calculateMovingAverage(data: CandlestickData[], period: number): LineData[] {
    const result: LineData[] = [];

    if (data.length < period) {
      return result; // Retorna vazio se não houver dados suficientes para calcular a média
    }

    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      sum += data[i].close;

      if (i >= period - 1) {
        if (i >= period) {
          sum -= data[i - period].close; // Remove o candle fora do período
        }

        // Adiciona o ponto da média móvel ao resultado
        result.push({
          time: data[i].time, // Usa o mesmo `time` do candle atual
          value: sum / period, // Média do período
          period : period
        });
      }
    }

    return result;
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedOption = event.option.value;
    console.log('Opção selecionada:', selectedOption);
    //const ma8 = this.calculateMovingAverage(this.dataBinance, 14);
    const ma80 = this.calculateMovingAverage(this.dataBinance, 5);
    // Adicionar médias móveis ao gráfico
    //this.chart.addLineSeries({ color: '#ffff' }).setData(ma8);
    this.chart.addLineSeries({ color: 'blue' }).setData(ma80);
    // Verificar e marcar o setup 123 de compra
    this.identifyAndMarkSetup(this.dataBinance, [ma80], this.candlestickSeries, selectedOption);
  }

  private identifyAndMarkSetup(
    data: CandlestickData[],
    movingAverages: LineData[][], // Lista de médias móveis
    candlestickSeries: any,
    selectedSetup: SetupType // Receber o tipo de setup escolhido pelo cliente
  ): void {
    const offset = 5 - 1; // Define o deslocamento com base no período

    const updatedData = [...data];
    // Fazer uma cópia dos dados originais para modificar

    // Definir a fábrica de setups
    const setupFactory = {
      insideBar: InsideBarSetup,
      setup123compra: Setup123Compra
    };

    // Verificar o setup escolhido
    const SetupClass = setupFactory[selectedSetup]; // Seleção do setup pelo cliente
    if (!SetupClass) {
      console.error('Setup inválido!');
      return; // Se não houver setup selecionado, não faz nada
    }

    // Instanciando o setup escolhido
    const setupToApply = new SetupClass();

    // Iterar sobre os dados de candlestick para identificar o setup
    let countMovingAverages = 0;

    for (let i = offset+1; i < data.length - 1; i++) {      
      if (setupToApply.check(data, i, movingAverages, countMovingAverages))
        setupToApply.applyChanges(updatedData, i);
      countMovingAverages++;
    }

    // Atualizar os dados da série com o setup aplicado
    candlestickSeries.setData(updatedData);
  }

  ngOnDestroy(): void {
    // Limpar o gráfico ao destruir o componente
    if (this.chart) {
      this.chart.remove();
    }
  }
}
