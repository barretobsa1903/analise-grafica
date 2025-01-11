 export interface Setup {
    check(data: any[], i: number, movingAverages: any[], countMovingAverages:number): boolean;  // Método para verificar se o setup deve ser aplicado
    applyChanges(updatedData: any[], i: number): void; // Método para aplicar as mudanças nos dados
  }
  