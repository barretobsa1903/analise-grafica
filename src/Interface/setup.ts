import { IndicesForMovingAveragesDTO } from "src/app/objetos/setupsDTO";

 export interface Setup {
    check(data: any[], i: number, movingAverages: any[],indices: IndicesForMovingAveragesDTO[]): boolean;  // Método para verificar se o setup deve ser aplicado
    applyChanges(updatedData: any[], i: number): void; // Método para aplicar as mudanças nos dados
  }
  