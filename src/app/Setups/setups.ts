import { Setup } from "src/Interface/setup";
import { IndicesForMovingAveragesDTO } from "../objetos/setupsDTO";

export class InsideBarSetup implements Setup {
    check(
        data: any[],
        i: number,
        movingAverages: any[][],
        indices: IndicesForMovingAveragesDTO[]
    ): boolean {
        const prevCandle = data[i - 1];
        const currentCandle = data[i];

        let isAboveAllMAs = true;

        if (movingAverages.length == 0 && indices.length == 0) {
            return isAboveAllMAs &&
                currentCandle.high < prevCandle.high &&
                currentCandle.low > prevCandle.low;
        }

        // Verificar se o candle está acima de todas as médias móveis
        isAboveAllMAs = movingAverages.every((ma, idx) => {
            const indexOffset = indices[idx].index; // Ponto inicial para esta média móvel

            const currentMA = ma[indexOffset]?.value;

            // Verifica se os valores existem e se o candle está acima da média móvel
            return (
                currentMA !== undefined &&
                currentCandle.close >= currentMA
            );
        });

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
    check(
        data: any[],
        i: number,
        movingAverages: any[][],
        indices: IndicesForMovingAveragesDTO[]
    ): boolean {
        const prevCandle = data[i - 1];
        const currentCandle = data[i];
        const nextCandle = data[i + 1];

        let isAboveAllMAs = true;

        if (movingAverages.length == 0 && indices.length == 0) {
            return isAboveAllMAs &&
                prevCandle.low > currentCandle.low && // A mínima do candle atual é menor que a mínima do anterior
                nextCandle.low > currentCandle.low  // A mínima do próximo candle é maior ou igual à do atual
        }

        // Verificar se o candle está acima de todas as médias móveis
        isAboveAllMAs = movingAverages.every((ma, idx) => {
            const indexOffset = indices[idx].index; // Ponto inicial para esta média móvel

            const currentMA = ma[indexOffset]?.value;

            // Verifica se os valores existem e se o candle está acima da média móvel
            return (
                currentMA !== undefined &&
                currentCandle.close >= currentMA &&
                prevCandle.close >= currentMA &&
                currentCandle.close >= currentMA &&
                nextCandle.close >= currentMA
            );
        });

        // Identificar Inside Bars
        return isAboveAllMAs &&
            prevCandle.low > currentCandle.low && // A mínima do candle atual é menor que a mínima do anterior
            nextCandle.low > currentCandle.low  // A mínima do próximo candle é maior ou igual à do atual
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

export class BarraVermelhaIgnoradaSetup implements Setup {
    check(
        data: any[],
        i: number,
        movingAverages: any[][],
        indices: IndicesForMovingAveragesDTO[]
    ): boolean {
        const prevCandle = data[i - 1];
        const currentCandle = data[i];
        const nextCandle = data[i + 1];

        let isAboveAllMAs = true;

        if (movingAverages.length == 0 && indices.length == 0) {
            // Identificar Inside Bars
            return isAboveAllMAs &&
                currentCandle.close < prevCandle.close &&
                currentCandle.high < nextCandle.high
        }


        // Verificar se o candle está acima de todas as médias móveis
        isAboveAllMAs = movingAverages.every((ma, idx) => {
            const indexOffset = indices[idx].index; // Ponto inicial para esta média móvel

            const currentMA = ma[indexOffset]?.value;

            // Verifica se os valores existem e se o candle está acima da média móvel
            return (
                currentMA !== undefined &&
                prevCandle.close >= currentMA &&
                currentCandle.close >= currentMA &&
                nextCandle.close >= currentMA
            );
        });

        // Identificar Inside Bars
        return isAboveAllMAs &&
            currentCandle.close < prevCandle.close &&
            currentCandle.high < nextCandle.high
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
