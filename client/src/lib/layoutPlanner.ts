// Layout Planner for Beam & Vault Slab Systems
// Calculates optimal distribution of joists (viguetas) and vaults (bovedillas)
// Uses same logic as SlabComparator for consistency

// Standard joist lengths available (in meters)
const STANDARD_LENGTHS = [3, 4, 5, 6];

// Bovedilla dimensions (standard polystyrene bovedilla)
const BOVEDILLA = {
  length: 1.22,  // 1.22m along joist direction
  width: 0.63,   // 0.63m perpendicular
  axisDistance: 0.70, // 70cm between viguetas
};

// Chain width (cadena perimetral)
const CHAIN_WIDTH = 0.15;

export interface LayoutResult {
  orientation: 'horizontal' | 'vertical';
  joistCount: number;
  joistLength: number;
  selectedBeamLength: number;
  joists: JoistInfo[];
  joistPositions: number[];
  bovedillaRows: BovedillaRow[];
  vaultsPerBay: number;
  totalVaults: number;
  adjustmentPieces: number;
  waste: number;
  wastePercentage: number;
  recommendations: string[];
  longestSide: number;
  shortestSide: number;
}

export interface JoistInfo {
  x: number;
  y: number;
  length: number;
  cutLength: number;
  isEdge: boolean;
}

export interface BovedillaRow {
  y: number;
  pieces: { x: number; width: number; isAdjustment: boolean }[];
}

export function calculateLayout(lengthInput: number, widthInput: number): LayoutResult {
  // Ensure we have valid numbers
  const length = Number(lengthInput) || 1;
  const width = Number(widthInput) || 1;
  
  // Determine longest and shortest sides
  const longestSide = Math.max(length, width);
  const shortestSide = Math.min(length, width);
  const orientation = length >= width ? 'horizontal' : 'vertical';
  
  // Calculate number of viguetas: divide shortest side (claro) by 0.70, round DOWN
  // No viguetas at edges (space for perimeter chain)
  const numJoists = Math.floor(shortestSide / BOVEDILLA.axisDistance);
  
  // Joist length is the shortest side (joists span across the shortest dimension)
  const joistLength = shortestSide;
  
  // Select appropriate beam length
  const maxStandardLength = STANDARD_LENGTHS[STANDARD_LENGTHS.length - 1]; // 6m
  let selectedBeamLength: number;
  let piecesPerJoist: number;
  
  if (joistLength <= maxStandardLength) {
    selectedBeamLength = STANDARD_LENGTHS.find(len => len >= joistLength) || maxStandardLength;
    piecesPerJoist = 1;
  } else {
    selectedBeamLength = maxStandardLength;
    const LAP_SPLICE = 0.30;
    piecesPerJoist = Math.ceil(joistLength / (maxStandardLength - LAP_SPLICE));
  }
  
  // Calculate joist positions (evenly distributed, no joists at edges)
  const joistPositions: number[] = [];
  const joistSpacing = longestSide / (numJoists + 1);
  
  for (let i = 1; i <= numJoists; i++) {
    joistPositions.push(joistSpacing * i);
  }
  
  // Generate joist info
  const joists: JoistInfo[] = joistPositions.map((pos, i) => ({
    x: orientation === 'horizontal' ? 0 : pos,
    y: orientation === 'horizontal' ? pos : 0,
    length: joistLength,
    cutLength: selectedBeamLength - joistLength,
    isEdge: i === 0 || i === numJoists - 1
  }));
  
  // Calculate bovedillas - fill 100% of spaces between viguetas
  const bovedillaRows: BovedillaRow[] = [];
  let totalBovedillas = 0;
  let adjustmentPieces = 0;
  
  // Calculate bovedilla layout for each row (space between joists)
  for (let i = 0; i <= numJoists; i++) {
    const rowStart = i === 0 ? CHAIN_WIDTH : joistPositions[i - 1];
    const rowEnd = i === numJoists ? longestSide - CHAIN_WIDTH : joistPositions[i];
    const rowWidth = rowEnd - rowStart;
    
    if (rowWidth <= 0) continue;
    
    // Calculate bovedilla pieces along the shortest side
    const pieces: { x: number; width: number; isAdjustment: boolean }[] = [];
    const availableLength = shortestSide - (CHAIN_WIDTH * 2);
    
    const fullPieces = Math.floor(availableLength / BOVEDILLA.length);
    const remainder = availableLength - (fullPieces * BOVEDILLA.length);
    
    let currentX = CHAIN_WIDTH;
    
    for (let p = 0; p < fullPieces; p++) {
      pieces.push({
        x: currentX + (p * BOVEDILLA.length),
        width: BOVEDILLA.length,
        isAdjustment: false,
      });
    }
    
    // Add adjustment piece if there's remainder
    if (remainder > 0.01) {
      pieces.push({
        x: currentX + (fullPieces * BOVEDILLA.length),
        width: remainder,
        isAdjustment: true,
      });
      adjustmentPieces++;
    }
    
    bovedillaRows.push({
      y: rowStart,
      pieces,
    });
    
    totalBovedillas += pieces.length;
  }
  
  // Calculate vaults per bay (for display purposes)
  const availableLength = shortestSide - (CHAIN_WIDTH * 2);
  const fullPiecesPerBay = Math.floor(availableLength / BOVEDILLA.length);
  const remainder = availableLength - (fullPiecesPerBay * BOVEDILLA.length);
  const vaultsPerBay = fullPiecesPerBay + (remainder > 0.01 ? 1 : 0);
  
  // Calculate waste
  const totalMaterial = selectedBeamLength * piecesPerJoist * numJoists;
  const effectiveCoverage = joistLength * numJoists;
  const waste = totalMaterial - effectiveCoverage;
  const wastePercentage = totalMaterial > 0 ? (waste / totalMaterial) * 100 : 0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (wastePercentage > 15) {
    recommendations.push(`Considere ajustar dimensiones para reducir desperdicio (${wastePercentage.toFixed(1)}%)`);
  }
  
  if (joistLength > 6) {
    recommendations.push(`Claro > 6m requiere ${piecesPerJoist} tramos de vigueta con traslape. Considere apoyos intermedios.`);
  }
  
  if (joistLength < 3) {
    recommendations.push("Claro muy corto. Verifique si conviene usar panel estructural.");
  }
  
  if (adjustmentPieces > 0) {
    recommendations.push(`Se requieren ${adjustmentPieces} piezas de ajuste de bovedilla.`);
  }
  
  return {
    orientation,
    joistCount: numJoists,
    joistLength,
    selectedBeamLength,
    joists,
    joistPositions,
    bovedillaRows,
    vaultsPerBay,
    totalVaults: totalBovedillas,
    adjustmentPieces,
    waste,
    wastePercentage,
    recommendations,
    longestSide,
    shortestSide,
  };
}
