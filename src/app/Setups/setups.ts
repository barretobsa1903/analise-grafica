import { Setup } from "src/Interface/setup";

export class InsideBarSetup implements Setup {
    check(data: any[], i: number, movingAverages: any[], countMovingAverages:number): boolean {
        const prevCandle = data[i - 1];
        const currentCandle = data[i];
        let isAboveAllMAs = true;

        // Verificar se o índice é válido para acessar todas as médias móveis
        for (const ma of movingAverages) {
                if (               
                    !ma[countMovingAverages] ||                
                    currentCandle.close <= ma[countMovingAverages].value
                ) {
                    isAboveAllMAs = false;
                    break;
                }
                        
        }

        // Identificar Inside Bars
        return isAboveAllMAs &&
            currentCandle.high < prevCandle.high &&
            currentCandle.low > prevCandle.low;
    }

    applyChanges(updatedData: any[], i: number): void {
        const currentCandle = updatedData[i];
        updatedData[i] = {
            ...currentCandle,
            color: 'yellow',
            borderColor: 'yellow',
            wickColor: 'yellow',
        };
    }
}

export class Setup123Compra implements Setup {
    check(data: any[], i: number, movingAverages: any[],countMovingAverages:number): boolean {
        const prevCandle = data[i - 1];
        const currentCandle = data[i];
        const nextCandle = data[i + 1];
        let isAboveAllMAs = true;

        // Verificar se o índice é válido para acessar todas as médias móveis
        for (const ma of movingAverages) {
            if (
                !ma[countMovingAverages - 1] ||
                !ma[countMovingAverages] ||
                !ma[countMovingAverages + 1] ||
                prevCandle.close < ma[countMovingAverages - 1].value ||
                currentCandle.close < ma[countMovingAverages].value ||
                nextCandle.close < ma[countMovingAverages + 1].value
            ) {
                isAboveAllMAs = false;
                break;
            }
        }

        // Identificar o setup 123
        return isAboveAllMAs &&
        prevCandle.low > currentCandle.low && // A mínima do candle atual é menor que a mínima do anterior
        nextCandle.low > currentCandle.low  // A mínima do próximo candle é maior ou igual à do atual
        //nextCandle.high <= currentCandle.high // A máxima do próximo candle é menor ou igual à do atual
  
    }

    applyChanges(updatedData: any[], i: number): void {
        const prevCandle = updatedData[i - 1];
        const currentCandle = updatedData[i];
        const nextCandle = updatedData[i + 1];

        updatedData[i - 1] = {
            ...prevCandle,
            borderColor: '#fff',
            wickColor: '#fff',
            color: '#fff',
        };
        updatedData[i] = {
            ...currentCandle,
            borderColor: 'yellow',
            wickColor: 'yellow',
            color: 'yellow',
        };
        updatedData[i + 1] = {
            ...nextCandle,
            borderColor: '#fff',
            wickColor: '#fff',
            color: '#fff',
        };
    }
}
