// Layout Planner for Beam & Vault Slab Systems
// Calculates optimal distribution of joists (viguetas) and vaults (bovedillas)
// Based on specifications: viguetas each 70cm, bovedillas 1.22x0.63m

// Standard joist lengths available (in meters)
const STANDARD_LENGTHS = [3, 4, 5, 6, 10];

// Bovedilla dimensions (standard polystyrene bovedilla)
const BOVEDILLA = {
  length: 1.22,  // 1.22m along joist direction
  width: 0.63,   // 0.63m perpendicular (axis distance between viguetas)
  axisDistance: 0.70, // 70cm between viguetas
};

// EPS density is FIXED at 8 kg/m³
export const EPS_DENSITY = 8;

// Peralte dimensions for bovedillas (height in meters)
export const PERALTE_HEIGHTS: { [key: number]: number } = {
  15: 0.15,
  20: 0.20,
  25: 0.25,
};

// Chain width (cadena perimetral)
const CHAIN_WIDTH = 0.15;

// Waste percentage
const WASTE_PERCENTAGE = 0.02; // 2%

// Malla electrosoldada specifications
// Standard rolls of 100m² (2.5m × 40m)
export const MALLA_ELECTROSOLDADA = {
  type: '6x6 10-10',
  caliber: 10,
  aperture: 0.10, // 10cm x 10cm
  rollWidth: 2.50, // standard roll width in meters
  rollLength: 40.00, // standard roll length in meters
  rollArea: 100, // m² per roll (2.5 × 40)
  overlap: 0.15, // 15cm overlap for splicing
  // Legacy sheet references for compatibility
  sheetWidth: 2.50,
  sheetLength: 40.00,
};

// Structural panel specifications
export const PANEL_ESTRUCTURAL = {
  width: 1.22,
  length: 2.44,
  maxLength: 5.00,
  thicknesses: [2, 3, 4, 5], // inches
  meshes: 2, // 2 welded wire meshes per panel
  meshCaliber: 14,
};

export interface MallaResult {
  areaTotal: number;
  areaWithWaste: number;
  sheets: number;
  type: string;
}

export interface PanelResult {
  wallArea: number;
  panelsRequired: number;
  panelsWithWaste: number;
  thickness: number;
  density: number;
  meshesRequired: number;
  dimensions: { width: number; length: number };
}

// Calculate structural panel requirements for walls
export function calculatePanels(
  height: number, 
  length: number, 
  thickness: number = 4, 
  density: number = 15
): PanelResult {
  const wallArea = height * length;
  const panelArea = PANEL_ESTRUCTURAL.width * PANEL_ESTRUCTURAL.length;
  const panelsRequired = Math.ceil(wallArea / panelArea);
  const panelsWithWaste = Math.ceil(panelsRequired * (1 + WASTE_PERCENTAGE));
  const meshesRequired = panelsWithWaste * PANEL_ESTRUCTURAL.meshes;
  
  return {
    wallArea,
    panelsRequired,
    panelsWithWaste,
    thickness,
    density: Math.min(Math.max(density, 14), 16), // Clamp between 14-16
    meshesRequired,
    dimensions: {
      width: PANEL_ESTRUCTURAL.width,
      length: PANEL_ESTRUCTURAL.length,
    },
  };
}

export interface LayoutResult {
  orientation: 'horizontal' | 'vertical';
  joistCount: number;
  joistCountWithWaste: number;
  joistLength: number;
  selectedBeamLength: number;
  joists: JoistInfo[];
  joistPositions: number[];
  bovedillaRows: BovedillaRow[];
  bovedillasPerRow: number;
  totalVaults: number;
  totalVaultsWithWaste: number;
  adjustmentPieces: number;
  waste: number;
  wastePercentage: number;
  recommendations: string[];
  longestSide: number;
  shortestSide: number;
  peralte: number;
  bovedillaVolume: number;
  malla: MallaResult;
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

// Get peralte based on claro (shortest side)
// P-15: claro ≤ 4.00m
// P-20: claro ≤ 5.00m  
// P-25: claro ≤ 10.00m
export function getPeralteFromClaro(claro: number): number {
  if (claro <= 4.00) return 15;
  if (claro <= 5.00) return 20;
  return 25;
}

export function calculateLayout(lengthInput: number, widthInput: number): LayoutResult {
  // Ensure we have valid numbers
  const length = Number(lengthInput) || 1;
  const width = Number(widthInput) || 1;
  
  // Determine longest and shortest sides
  const longestSide = Math.max(length, width);
  const shortestSide = Math.min(length, width); // This is the "claro"
  const orientation = length >= width ? 'horizontal' : 'vertical';
  
  // Determine peralte based on claro (shortest side)
  const peralte = getPeralteFromClaro(shortestSide);
  const bovedillaHeight = PERALTE_HEIGHTS[peralte];
  
  // ========================================
  // VIGUETAS CALCULATION
  // Cantidad = (lado más largo ÷ 0.70) → round to nearest integer
  // ========================================
  const numJoists = Math.round(longestSide / BOVEDILLA.axisDistance);
  const numJoistsWithWaste = Math.ceil(numJoists * (1 + WASTE_PERCENTAGE));
  
  // Joist length is the shortest side (joists span across the claro)
  const joistLength = shortestSide;
  
  // Select appropriate beam length
  const maxStandardLength = STANDARD_LENGTHS[STANDARD_LENGTHS.length - 1]; // 10m
  let selectedBeamLength: number;
  let piecesPerJoist: number;
  
  if (joistLength <= maxStandardLength) {
    selectedBeamLength = STANDARD_LENGTHS.find(len => len >= joistLength) || maxStandardLength;
    piecesPerJoist = 1;
  } else {
    // If claro > 10m, need intermediate supports
    selectedBeamLength = maxStandardLength;
    const LAP_SPLICE = 0.30;
    piecesPerJoist = Math.ceil(joistLength / (maxStandardLength - LAP_SPLICE));
  }
  
  // Calculate joist positions (evenly distributed)
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
  
  // ========================================
  // BOVEDILLAS CALCULATION
  // Bovedillas por fila = (largo de vigueta ÷ 1.22) → round UP
  // Total = bovedillas por fila × número de viguetas
  // ========================================
  const bovedillasPerRow = Math.ceil(joistLength / BOVEDILLA.length);
  const totalBovedillas = bovedillasPerRow * numJoists;
  const totalBovedillasWithWaste = Math.ceil(totalBovedillas * (1 + WASTE_PERCENTAGE));
  
  // Calculate bovedilla volume
  // Volumen = largo × ancho × peralte × total de bovedillas
  const singleBovedillaVolume = BOVEDILLA.length * BOVEDILLA.width * bovedillaHeight;
  const bovedillaVolume = singleBovedillaVolume * totalBovedillasWithWaste;
  
  // Build bovedilla rows for visualization
  const bovedillaRows: BovedillaRow[] = [];
  let adjustmentPieces = 0;
  
  for (let i = 0; i <= numJoists; i++) {
    const rowStart = i === 0 ? CHAIN_WIDTH : joistPositions[i - 1];
    const rowEnd = i === numJoists ? longestSide - CHAIN_WIDTH : joistPositions[i];
    const rowWidth = rowEnd - rowStart;
    
    if (rowWidth <= 0) continue;
    
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
  }
  
  // Calculate waste
  const totalMaterial = selectedBeamLength * piecesPerJoist * numJoists;
  const effectiveCoverage = joistLength * numJoists;
  const waste = totalMaterial - effectiveCoverage;
  const wastePercentage = totalMaterial > 0 ? (waste / totalMaterial) * 100 : 0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (shortestSide > 10) {
    const segments = Math.ceil(shortestSide / 10);
    recommendations.push(`Claro > 10m. Se divide en ${segments} tramos con apoyos intermedios.`);
  }
  
  if (wastePercentage > 15) {
    recommendations.push(`Considere ajustar dimensiones para reducir desperdicio (${wastePercentage.toFixed(1)}%)`);
  }
  
  if (joistLength > 6 && joistLength <= 10) {
    recommendations.push(`Claro de ${joistLength.toFixed(2)}m requiere vigueta de peralte 25.`);
  }
  
  if (joistLength < 3) {
    recommendations.push("Claro muy corto. Verifique si conviene usar panel estructural.");
  }
  
  if (adjustmentPieces > 0) {
    recommendations.push(`Se requieren ${adjustmentPieces} piezas de ajuste de bovedilla.`);
  }
  
  // ========================================
  // MALLA ELECTROSOLDADA CALCULATION
  // Cantidad = área total de losa + 2% desperdicio
  // Considera traslapes y ensambles
  // ========================================
  const slabArea = longestSide * shortestSide;
  const mallaAreaWithWaste = slabArea * (1 + WASTE_PERCENTAGE);
  const sheetArea = MALLA_ELECTROSOLDADA.sheetWidth * MALLA_ELECTROSOLDADA.sheetLength;
  const mallaSheets = Math.ceil(mallaAreaWithWaste / sheetArea);
  
  const malla: MallaResult = {
    areaTotal: slabArea,
    areaWithWaste: mallaAreaWithWaste,
    sheets: mallaSheets,
    type: MALLA_ELECTROSOLDADA.type,
  };
  
  return {
    orientation,
    joistCount: numJoists,
    joistCountWithWaste: numJoistsWithWaste,
    joistLength,
    selectedBeamLength,
    joists,
    joistPositions,
    bovedillaRows,
    bovedillasPerRow,
    totalVaults: totalBovedillas,
    totalVaultsWithWaste: totalBovedillasWithWaste,
    adjustmentPieces,
    waste,
    wastePercentage,
    recommendations,
    longestSide,
    shortestSide,
    peralte,
    bovedillaVolume,
    malla,
  };
}
