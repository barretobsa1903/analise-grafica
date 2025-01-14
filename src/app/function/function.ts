import { LineData } from "lightweight-charts";

export class FunctionMA {
    
    public static areMovingAveragesAlignedAndRising(
        movingAverages: LineData[][],
        index: number
      ): boolean {
        // Verificar se todas as médias móveis estão ordenadas no índice atual
        const areAligned = movingAverages.every((ma, idx, arr) => {
          if (idx === 0) return true; // A primeira média não tem uma anterior para comparar
          const currentValue = ma[index]?.value;
          const prevValue = arr[idx - 1][index]?.value;
      
          return (
            currentValue !== undefined &&
            prevValue !== undefined &&
            currentValue > prevValue // Verifica se está alinhada (ordem crescente)
          );
        });
      
        // Verificar se cada média móvel está inclinada para cima
        const areRising = movingAverages.every((ma) => {
          const currentValue = ma[index]?.value;
          const prevValue = ma[index - 1]?.value;
      
          return (
            currentValue !== undefined &&
            prevValue !== undefined &&
            currentValue > prevValue // Verifica se está inclinada para cima
          );
        });
      
        // Retorna true se ambas as condições forem atendidas
        return areAligned && areRising;
      }
      
}