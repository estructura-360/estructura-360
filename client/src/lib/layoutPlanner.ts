// Layout Planner for Beam & Vault Slab Systems
// Calculates optimal distribution of joists (viguetas) and vaults (bovedillas)

// Standard joist lengths available (in meters)
const STANDARD_LENGTHS = [3, 4, 5, 6];

// Standard spacing between joists (center to center) in meters
const JOIST_SPACING = 0.75; // 75cm typical

// Vault dimensions (standard bovedilla)
const VAULT_WIDTH = 0.60; // 60cm between joists
const VAULT_LENGTH = 0.25; // 25cm along joist direction

export interface LayoutResult {
  orientation: 'horizontal' | 'vertical';
  joistCount: number;
  joistLength: number;
  selectedBeamLength: number;
  joists: JoistInfo[];
  vaultsPerBay: number;
  totalVaults: number;
  waste: number;
  wastePercentage: number;
  recommendations: string[];
}

export interface JoistInfo {
  x: number;
  y: number;
  length: number;
  cutLength: number;
  isEdge: boolean;
}

interface OrientationAnalysis {
  joistCount: number;
  joistLength: number;
  selectedBeamLength: number;
  waste: number;
  wastePercentage: number;
  piecesPerJoist?: number;
}

function analyzeOrientation(joistDirection: number, perpendicular: number): OrientationAnalysis {
  // Joists run along joistDirection, spaced along perpendicular
  const joistCount = Math.ceil(perpendicular / JOIST_SPACING) + 1;
  const joistLength = joistDirection;
  
  // For spans > 6m, we need multiple pieces with lap splice
  const maxStandardLength = STANDARD_LENGTHS[STANDARD_LENGTHS.length - 1]; // 6m
  const LAP_SPLICE = 0.30; // 30cm overlap for splicing
  
  let selectedBeamLength: number;
  let piecesPerJoist: number;
  let totalMaterialPerJoist: number;
  
  if (joistLength <= maxStandardLength) {
    // Single piece - find best fitting standard length
    selectedBeamLength = STANDARD_LENGTHS.find(len => len >= joistLength) || maxStandardLength;
    piecesPerJoist = 1;
    totalMaterialPerJoist = selectedBeamLength;
  } else {
    // Multiple pieces needed - use largest standard pieces with splicing
    selectedBeamLength = maxStandardLength;
    // Calculate pieces needed: each additional piece needs lap splice overlap
    piecesPerJoist = Math.ceil(joistLength / (maxStandardLength - LAP_SPLICE));
    // Actual material used includes the full length of each piece
    totalMaterialPerJoist = selectedBeamLength * piecesPerJoist;
  }
  
  // Calculate waste
  const effectiveCoverage = joistLength;
  const wastePerJoist = totalMaterialPerJoist - effectiveCoverage;
  const totalWaste = wastePerJoist * joistCount;
  const totalMaterial = totalMaterialPerJoist * joistCount;
  const wastePercentage = totalMaterial > 0 ? (totalWaste / totalMaterial) * 100 : 0;
  
  return {
    joistCount,
    joistLength,
    selectedBeamLength,
    waste: totalWaste,
    wastePercentage,
    piecesPerJoist
  };
}

export function calculateLayout(lengthInput: number, widthInput: number): LayoutResult {
  // Ensure we have numbers
  const length = Number(lengthInput) || 1;
  const width = Number(widthInput) || 1;
  
  // Analyze both orientations
  const horizontalAnalysis = analyzeOrientation(length, width); // Joists run along length
  const verticalAnalysis = analyzeOrientation(width, length); // Joists run along width
  
  // Choose orientation with less waste
  const useHorizontal = horizontalAnalysis.wastePercentage <= verticalAnalysis.wastePercentage;
  const analysis = useHorizontal ? horizontalAnalysis : verticalAnalysis;
  const orientation = useHorizontal ? 'horizontal' : 'vertical';
  
  // Generate joist positions
  const perpendicular = useHorizontal ? width : length;
  const joists: JoistInfo[] = [];
  
  for (let i = 0; i < analysis.joistCount; i++) {
    const position = i * JOIST_SPACING;
    joists.push({
      x: useHorizontal ? 0 : position,
      y: useHorizontal ? position : 0,
      length: analysis.joistLength,
      cutLength: analysis.selectedBeamLength - analysis.joistLength,
      isEdge: i === 0 || i === analysis.joistCount - 1
    });
  }
  
  // Calculate vaults
  const baysCount = analysis.joistCount - 1;
  const joistDirectionLength = analysis.joistLength;
  const vaultsPerBay = Math.floor(joistDirectionLength / VAULT_LENGTH);
  const totalVaults = baysCount * vaultsPerBay;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (analysis.wastePercentage > 15) {
    recommendations.push(`Considere ajustar dimensiones para reducir desperdicio (${analysis.wastePercentage.toFixed(1)}%)`);
  }
  
  if (analysis.joistLength > 6) {
    const pieces = analysis.piecesPerJoist || 1;
    recommendations.push(`Claro > 6m requiere ${pieces} tramos de vigueta con traslape. Considere apoyos intermedios para mayor seguridad.`);
  }
  
  if (analysis.joistLength < 3) {
    recommendations.push("Claro muy corto. Verifique si conviene usar panel estructural en lugar de vigueta/bovedilla");
  }
  
  const alternativeAnalysis = useHorizontal ? verticalAnalysis : horizontalAnalysis;
  if (Math.abs(analysis.wastePercentage - alternativeAnalysis.wastePercentage) < 2) {
    recommendations.push("Ambas orientaciones son similares en eficiencia");
  }
  
  return {
    orientation,
    joistCount: analysis.joistCount,
    joistLength: analysis.joistLength,
    selectedBeamLength: analysis.selectedBeamLength,
    joists,
    vaultsPerBay,
    totalVaults,
    waste: analysis.waste,
    wastePercentage: analysis.wastePercentage,
    recommendations
  };
}
