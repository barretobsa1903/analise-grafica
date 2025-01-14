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
import { BarraVermelhaIgnoradaSetup, InsideBarSetup, Setup123Compra } from './Setups/setups'; // Caminho relativo para o arquivo
import { Setup } from '../Interface/setup'; // Caminho relativo para o arquivo
import { IndicesForMovingAveragesDTO, SetupDTO } from './objetos/setupsDTO';
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
  options: SetupDTO[] = [
    { nome: 'Insidebar', descricao: 'insideBar' },
    { nome: 'Barra Vermelha Ignorada', descricao: 'barravermelhaignorada' },  
    { nome: '123 de compra', descricao: 'setup123compra' }];
  
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
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=400  `;
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
          period: period
        });
      }
    }

    return result;
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedOption = event.option.value;
    console.log('Opção selecionada:', selectedOption);

    
    const ma8 = this.calculateMovingAverage(this.dataBinance, 8);
    const ma80 = this.calculateMovingAverage(this.dataBinance, 80);

    const periods = [8, 80];

    const indices = this.findIndicesForMovingAverages([ma8, ma80], periods);

    console.log(indices);

    this.chart.addLineSeries({ color: '#ffff' }).setData(ma8);
    this.chart.addLineSeries({ color: 'blue' }).setData(ma80);

    this.identifyAndMarkSetup(this.dataBinance, [ma8, ma80], this.candlestickSeries, selectedOption, indices);
  }

  findIndicesForMovingAverages(
    movingAverages: LineData[][],
    periods: number[]
  ): IndicesForMovingAveragesDTO[] {
    // Calcular o maior deslocamento necessário
    const startPoint = Math.max(...periods.map((period) => period - 1));

    // Encontrar os índices para cada média móvel no ponto inicial
    const indices = movingAverages.map((ma, i) => ({
      period: periods[i], // Período da média
      index: ma.length > startPoint ? startPoint - (periods[i] - 1) : -1, // Verifica se há dados suficientes
    }));

    return indices;
  }

  private identifyAndMarkSetup(
    data: CandlestickData[],
    movingAverages: LineData[][], // Lista de médias móveis
    candlestickSeries: any,
    selectedSetup: SetupType, // Receber o tipo de setup escolhido pelo cliente
    indices: IndicesForMovingAveragesDTO[]
  ): void {

    const updatedData = [...data];
    // Fazer uma cópia dos dados originais para modificar

    // Definir a fábrica de setups
    const setupFactory = {
      insideBar: InsideBarSetup,
      setup123compra: Setup123Compra,
      barravermelhaignorada: BarraVermelhaIgnoradaSetup
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
    for (let i = 79; i < data.length - 1; i++) {
      if (setupToApply.check(data, i, movingAverages, indices))
        setupToApply.applyChanges(updatedData, i);
      // Incrementa o valor de `index` em 1 para cada objeto em `indices`
      indices.forEach((obj) => {
        obj.index += 1;
      });
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
