#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VALID_TIERS = new Set(['barony', 'county', 'major_port', 'maritime_hub']);
const VALID_REGIONS = new Set(['wessex', 'francia', 'north_sea', 'rhine', 'london']);
const VALID_TERRAIN = new Set(['plains', 'dense_forest', 'marsh', 'deep_sea', 'coastal_waters']);
const VALID_TRANSIT = new Set([
  'roman_road',
  'forest_trail',
  'river_downstream',
  'river_upstream',
  'open_sea'
]);
const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'];

const nodeSeeds = [
  { nodeId: 'barony_winchester', name: 'Winchester', tier: 'county', region: 'wessex', coordinates: [320, 450], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'port_southampton', name: 'Southampton', tier: 'major_port', region: 'wessex', coordinates: [350, 520], terrain: 'coastal_waters', baseAttritionRate: 0.12 },
  { nodeId: 'barony_salisbury', name: 'Salisbury', tier: 'barony', region: 'wessex', coordinates: [310, 480], terrain: 'plains', baseAttritionRate: 0.1 },
  { nodeId: 'barony_exeter', name: 'Exeter', tier: 'county', region: 'wessex', coordinates: [250, 520], terrain: 'dense_forest', baseAttritionRate: 0.15 },
  { nodeId: 'barony_dorchester', name: 'Dorchester', tier: 'barony', region: 'wessex', coordinates: [280, 510], terrain: 'plains', baseAttritionRate: 0.09 },
  { nodeId: 'barony_bath', name: 'Bath', tier: 'county', region: 'wessex', coordinates: [280, 420], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'barony_wells', name: 'Wells', tier: 'barony', region: 'wessex', coordinates: [300, 430], terrain: 'plains', baseAttritionRate: 0.07 },
  { nodeId: 'barony_glastonbury', name: 'Glastonbury', tier: 'barony', region: 'wessex', coordinates: [310, 450], terrain: 'marsh', baseAttritionRate: 0.2 },

  { nodeId: 'city_london', name: 'London', tier: 'maritime_hub', region: 'london', coordinates: [420, 380], terrain: 'coastal_waters', baseAttritionRate: 0.06 },
  { nodeId: 'barony_canterbury', name: 'Canterbury', tier: 'county', region: 'london', coordinates: [480, 360], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'port_dover', name: 'Dover', tier: 'major_port', region: 'london', coordinates: [520, 350], terrain: 'coastal_waters', baseAttritionRate: 0.14 },
  { nodeId: 'barony_rochester', name: 'Rochester', tier: 'barony', region: 'london', coordinates: [440, 370], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'barony_colchester', name: 'Colchester', tier: 'county', region: 'london', coordinates: [480, 320], terrain: 'plains', baseAttritionRate: 0.09 },
  { nodeId: 'barony_lincoln', name: 'Lincoln', tier: 'county', region: 'london', coordinates: [420, 280], terrain: 'plains', baseAttritionRate: 0.09 },

  { nodeId: 'port_rouen', name: 'Rouen', tier: 'major_port', region: 'francia', coordinates: [550, 420], terrain: 'coastal_waters', baseAttritionRate: 0.11 },
  { nodeId: 'city_paris', name: 'Paris', tier: 'maritime_hub', region: 'francia', coordinates: [600, 480], terrain: 'plains', baseAttritionRate: 0.07 },
  { nodeId: 'barony_tours', name: 'Tours', tier: 'county', region: 'francia', coordinates: [620, 560], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'port_boulogne', name: 'Boulogne', tier: 'major_port', region: 'francia', coordinates: [560, 340], terrain: 'coastal_waters', baseAttritionRate: 0.13 },
  { nodeId: 'port_calais', name: 'Calais', tier: 'major_port', region: 'francia', coordinates: [540, 310], terrain: 'coastal_waters', baseAttritionRate: 0.14 },
  { nodeId: 'barony_amiens', name: 'Amiens', tier: 'county', region: 'francia', coordinates: [580, 380], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'barony_orleans', name: 'Orleans', tier: 'county', region: 'francia', coordinates: [610, 520], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'barony_chartres', name: 'Chartres', tier: 'barony', region: 'francia', coordinates: [590, 500], terrain: 'plains', baseAttritionRate: 0.08 },
  { nodeId: 'barony_dieppe', name: 'Dieppe', tier: 'barony', region: 'francia', coordinates: [520, 380], terrain: 'coastal_waters', baseAttritionRate: 0.12 },

  { nodeId: 'port_bruges', name: 'Bruges', tier: 'major_port', region: 'rhine', coordinates: [640, 300], terrain: 'coastal_waters', baseAttritionRate: 0.1 },
  { nodeId: 'barony_ghent', name: 'Ghent', tier: 'county', region: 'rhine', coordinates: [660, 310], terrain: 'plains', baseAttritionRate: 0.09 },
  { nodeId: 'city_cologne', name: 'Cologne', tier: 'maritime_hub', region: 'rhine', coordinates: [720, 360], terrain: 'coastal_waters', baseAttritionRate: 0.09 },
  { nodeId: 'barony_mainz', name: 'Mainz', tier: 'county', region: 'rhine', coordinates: [760, 420], terrain: 'plains', baseAttritionRate: 0.1 },
  { nodeId: 'barony_worms', name: 'Worms', tier: 'barony', region: 'rhine', coordinates: [780, 460], terrain: 'plains', baseAttritionRate: 0.09 },
  { nodeId: 'barony_amsterdam', name: 'Amsterdam', tier: 'barony', region: 'rhine', coordinates: [680, 260], terrain: 'marsh', baseAttritionRate: 0.18 },
  { nodeId: 'barony_antwerp', name: 'Antwerp', tier: 'county', region: 'rhine', coordinates: [670, 290], terrain: 'coastal_waters', baseAttritionRate: 0.1 },

  { nodeId: 'maritime_channel_east', name: 'English Channel (East)', tier: 'barony', region: 'north_sea', coordinates: [520, 330], terrain: 'deep_sea', baseAttritionRate: 0.25 },
  { nodeId: 'maritime_channel_central', name: 'English Channel (Central)', tier: 'barony', region: 'north_sea', coordinates: [450, 360], terrain: 'deep_sea', baseAttritionRate: 0.22 },
  { nodeId: 'maritime_north_sea', name: 'North Sea Hub', tier: 'maritime_hub', region: 'north_sea', coordinates: [580, 240], terrain: 'deep_sea', baseAttritionRate: 0.28 },
  { nodeId: 'maritime_thames_mouth', name: 'Thames Estuary', tier: 'barony', region: 'north_sea', coordinates: [450, 340], terrain: 'coastal_waters', baseAttritionRate: 0.16 },
  { nodeId: 'maritime_seine_mouth', name: 'Seine Estuary', tier: 'barony', region: 'north_sea', coordinates: [540, 390], terrain: 'coastal_waters', baseAttritionRate: 0.15 },
  { nodeId: 'maritime_meuse_mouth', name: 'Meuse Estuary', tier: 'barony', region: 'north_sea', coordinates: [680, 280], terrain: 'coastal_waters', baseAttritionRate: 0.14 }
];

const connectionDefinitions = [
  { from: 'barony_winchester', to: 'barony_salisbury', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.8, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'barony_winchester', to: 'port_southampton', transitType: 'roman_road', distanceWeeks: 1.0, riskModifier: 0.7, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.2 } },
  { from: 'barony_winchester', to: 'barony_bath', transitType: 'roman_road', distanceWeeks: 3.0, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.4 } },
  { from: 'barony_bath', to: 'barony_wells', transitType: 'roman_road', distanceWeeks: 1.0, riskModifier: 0.6, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.1 } },
  { from: 'barony_wells', to: 'barony_glastonbury', transitType: 'forest_trail', distanceWeeks: 1.5, riskModifier: 1.2, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.0, winter: 1.5 } },
  { from: 'barony_salisbury', to: 'barony_dorchester', transitType: 'roman_road', distanceWeeks: 2.0, riskModifier: 0.8, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'barony_dorchester', to: 'barony_exeter', transitType: 'roman_road', distanceWeeks: 3.5, riskModifier: 1.0, seasonalWeights: { spring: 1.15, summer: 1.0, autumn: 1.0, winter: 1.5 } },
  { from: 'barony_exeter', to: 'port_southampton', transitType: 'forest_trail', distanceWeeks: 4.5, riskModifier: 1.1, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.0, winter: 1.6 } },

  { from: 'barony_winchester', to: 'city_london', transitType: 'roman_road', distanceWeeks: 3.0, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'barony_bath', to: 'city_london', transitType: 'roman_road', distanceWeeks: 4.5, riskModifier: 0.95, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },

  { from: 'city_london', to: 'barony_rochester', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.7, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.2 } },
  { from: 'barony_rochester', to: 'barony_canterbury', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.8, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.2 } },
  { from: 'barony_canterbury', to: 'port_dover', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.8, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.2 } },
  { from: 'city_london', to: 'barony_colchester', transitType: 'roman_road', distanceWeeks: 2.0, riskModifier: 0.8, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.25 } },
  { from: 'barony_colchester', to: 'barony_lincoln', transitType: 'roman_road', distanceWeeks: 3.5, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },

  { from: 'port_southampton', to: 'maritime_channel_central', transitType: 'open_sea', distanceWeeks: 2.0, riskModifier: 1.3, seasonalWeights: { spring: 1.25, summer: 1.0, autumn: 1.1, winter: 1.8 } },
  { from: 'maritime_channel_central', to: 'port_rouen', transitType: 'open_sea', distanceWeeks: 2.5, riskModifier: 1.4, seasonalWeights: { spring: 1.3, summer: 1.0, autumn: 1.15, winter: 1.9 } },

  { from: 'city_london', to: 'maritime_thames_mouth', transitType: 'river_downstream', distanceWeeks: 1.0, riskModifier: 0.8, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.95, winter: 1.2 } },
  { from: 'maritime_thames_mouth', to: 'port_dover', transitType: 'open_sea', distanceWeeks: 2.0, riskModifier: 1.3, seasonalWeights: { spring: 1.25, summer: 1.0, autumn: 1.1, winter: 1.8 } },
  { from: 'port_dover', to: 'maritime_channel_east', transitType: 'open_sea', distanceWeeks: 1.5, riskModifier: 1.35, seasonalWeights: { spring: 1.3, summer: 1.0, autumn: 1.15, winter: 1.85 } },
  { from: 'maritime_channel_east', to: 'port_calais', transitType: 'open_sea', distanceWeeks: 1.0, riskModifier: 1.25, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.1, winter: 1.7 } },

  { from: 'port_rouen', to: 'city_paris', transitType: 'river_downstream', distanceWeeks: 3.0, riskModifier: 0.85, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 1.0, winter: 1.25 } },
  { from: 'port_rouen', to: 'port_boulogne', transitType: 'open_sea', distanceWeeks: 2.5, riskModifier: 1.3, seasonalWeights: { spring: 1.25, summer: 1.0, autumn: 1.1, winter: 1.75 } },
  { from: 'port_boulogne', to: 'port_calais', transitType: 'roman_road', distanceWeeks: 1.0, riskModifier: 0.8, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.95, winter: 1.2 } },
  { from: 'port_calais', to: 'barony_amiens', transitType: 'roman_road', distanceWeeks: 2.5, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'barony_amiens', to: 'city_paris', transitType: 'roman_road', distanceWeeks: 2.5, riskModifier: 0.85, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.2 } },
  { from: 'barony_amiens', to: 'barony_dieppe', transitType: 'roman_road', distanceWeeks: 2.0, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.25 } },
  { from: 'barony_dieppe', to: 'port_rouen', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.8, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.95, winter: 1.2 } },

  { from: 'city_paris', to: 'barony_chartres', transitType: 'roman_road', distanceWeeks: 2.0, riskModifier: 0.8, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.2 } },
  { from: 'barony_chartres', to: 'barony_orleans', transitType: 'roman_road', distanceWeeks: 2.0, riskModifier: 0.85, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.25 } },
  { from: 'barony_orleans', to: 'barony_tours', transitType: 'river_downstream', distanceWeeks: 2.5, riskModifier: 0.9, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 1.0, winter: 1.3 } },

  { from: 'port_bruges', to: 'barony_ghent', transitType: 'roman_road', distanceWeeks: 1.0, riskModifier: 0.7, seasonalWeights: { spring: 1.0, summer: 1.0, autumn: 0.9, winter: 1.15 } },
  { from: 'barony_ghent', to: 'barony_antwerp', transitType: 'roman_road', distanceWeeks: 1.5, riskModifier: 0.8, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.2 } },
  { from: 'barony_antwerp', to: 'barony_amsterdam', transitType: 'forest_trail', distanceWeeks: 2.0, riskModifier: 1.15, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.05, winter: 1.4 } },
  { from: 'barony_antwerp', to: 'city_cologne', transitType: 'roman_road', distanceWeeks: 3.0, riskModifier: 0.9, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'city_cologne', to: 'barony_mainz', transitType: 'river_downstream', distanceWeeks: 3.5, riskModifier: 0.95, seasonalWeights: { spring: 1.1, summer: 1.0, autumn: 0.95, winter: 1.35 } },
  { from: 'barony_mainz', to: 'barony_worms', transitType: 'river_downstream', distanceWeeks: 1.5, riskModifier: 0.85, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.25 } },

  { from: 'barony_amsterdam', to: 'maritime_meuse_mouth', transitType: 'river_downstream', distanceWeeks: 1.0, riskModifier: 0.9, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.3 } },
  { from: 'maritime_meuse_mouth', to: 'maritime_north_sea', transitType: 'open_sea', distanceWeeks: 2.0, riskModifier: 1.4, seasonalWeights: { spring: 1.3, summer: 1.0, autumn: 1.15, winter: 1.85 } },
  { from: 'maritime_north_sea', to: 'maritime_channel_east', transitType: 'open_sea', distanceWeeks: 2.5, riskModifier: 1.45, seasonalWeights: { spring: 1.35, summer: 1.0, autumn: 1.2, winter: 1.9 } },
  { from: 'maritime_north_sea', to: 'barony_colchester', transitType: 'open_sea', distanceWeeks: 3.0, riskModifier: 1.5, seasonalWeights: { spring: 1.4, summer: 1.0, autumn: 1.25, winter: 2.0 } },
  { from: 'port_bruges', to: 'maritime_meuse_mouth', transitType: 'open_sea', distanceWeeks: 1.5, riskModifier: 1.2, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.1, winter: 1.65 } },

  { from: 'maritime_channel_central', to: 'maritime_channel_east', transitType: 'open_sea', distanceWeeks: 1.5, riskModifier: 1.25, seasonalWeights: { spring: 1.2, summer: 1.0, autumn: 1.1, winter: 1.75 } },
  { from: 'maritime_channel_central', to: 'maritime_seine_mouth', transitType: 'open_sea', distanceWeeks: 1.0, riskModifier: 1.15, seasonalWeights: { spring: 1.15, summer: 1.0, autumn: 1.05, winter: 1.6 } },
  { from: 'maritime_seine_mouth', to: 'port_rouen', transitType: 'river_downstream', distanceWeeks: 1.5, riskModifier: 0.85, seasonalWeights: { spring: 1.05, summer: 1.0, autumn: 0.95, winter: 1.2 } }
];

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateSeasonalWeights(weights) {
  if (!weights || typeof weights !== 'object') return false;
  const keys = Object.keys(weights);
  if (keys.length !== 4) return false;

  for (const key of SEASON_KEYS) {
    if (!(key in weights)) return false;
    if (!isFiniteNumber(weights[key]) || weights[key] < 0.5 || weights[key] > 2.5) {
      return false;
    }
  }

  return true;
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') {
    throw new Error('Invalid node encountered');
  }

  const required = ['nodeId', 'name', 'tier', 'region', 'coordinates', 'terrain', 'baseAttritionRate'];
  for (const field of required) {
    if (!(field in node)) {
      throw new Error(`Node missing required field: ${field}`);
    }
  }

  if (!VALID_TIERS.has(node.tier)) {
    throw new Error(`Node ${node.nodeId} has invalid tier: ${node.tier}`);
  }

  if (!VALID_REGIONS.has(node.region)) {
    throw new Error(`Node ${node.nodeId} has invalid region: ${node.region}`);
  }

  if (!VALID_TERRAIN.has(node.terrain)) {
    throw new Error(`Node ${node.nodeId} has invalid terrain: ${node.terrain}`);
  }

  if (!Array.isArray(node.coordinates) || node.coordinates.length !== 2) {
    throw new Error(`Node ${node.nodeId} has invalid coordinates`);
  }

  const [x, y] = node.coordinates;
  if (!isFiniteNumber(x) || !isFiniteNumber(y) || x < 0 || x > 1000 || y < 0 || y > 1000) {
    throw new Error(`Node ${node.nodeId} coordinates out of normalized bounds`);
  }

  if (!isFiniteNumber(node.baseAttritionRate) || node.baseAttritionRate < 0.01 || node.baseAttritionRate > 0.35) {
    throw new Error(`Node ${node.nodeId} has invalid baseAttritionRate`);
  }

  return {
    nodeId: String(node.nodeId),
    name: String(node.name),
    tier: node.tier,
    region: node.region,
    coordinates: [Number(x), Number(y)],
    terrain: node.terrain,
    baseAttritionRate: Number(node.baseAttritionRate),
    connections: []
  };
}

function buildGraph() {
  const nodes = nodeSeeds.map(normalizeNode);

  const map = new Map();
  for (const node of nodes) {
    if (map.has(node.nodeId)) {
      throw new Error(`Duplicate nodeId detected: ${node.nodeId}`);
    }
    map.set(node.nodeId, node);
  }

  const seenPairs = new Set();

  for (const def of connectionDefinitions) {
    if (!map.has(def.from)) {
      throw new Error(`Connection source node missing: ${def.from}`);
    }
    if (!map.has(def.to)) {
      throw new Error(`Connection target node missing: ${def.to}`);
    }

    if (!VALID_TRANSIT.has(def.transitType)) {
      throw new Error(`Unknown transitType "${def.transitType}" for edge ${def.from} -> ${def.to}`);
    }

    if (!isFiniteNumber(def.distanceWeeks) || def.distanceWeeks <= 0) {
      throw new Error(`Invalid distanceWeeks for edge ${def.from} -> ${def.to}`);
    }

    if (!isFiniteNumber(def.riskModifier) || def.riskModifier <= 0) {
      throw new Error(`Invalid riskModifier for edge ${def.from} -> ${def.to}`);
    }

    if (!validateSeasonalWeights(def.seasonalWeights)) {
      throw new Error(`Invalid seasonal weights for edge ${def.from} -> ${def.to}`);
    }

    const keyA = `${def.from}->${def.to}`;
    if (seenPairs.has(keyA)) {
      continue;
    }
    seenPairs.add(keyA);

    const forwardEdge = {
      targetNodeId: def.to,
      transitType: def.transitType,
      distanceWeeks: Number(def.distanceWeeks),
      riskModifier: Number(def.riskModifier),
      seasonalWeights: {
        spring: Number(def.seasonalWeights.spring),
        summer: Number(def.seasonalWeights.summer),
        autumn: Number(def.seasonalWeights.autumn),
        winter: Number(def.seasonalWeights.winter)
      }
    };

    const reverseEdge = {
      targetNodeId: def.from,
      transitType: def.transitType,
      distanceWeeks: Number((Number(def.distanceWeeks) * 1.05).toFixed(3)),
      riskModifier: Number(def.riskModifier),
      seasonalWeights: {
        spring: Number(def.seasonalWeights.spring),
        summer: Number(def.seasonalWeights.summer),
        autumn: Number(def.seasonalWeights.autumn),
        winter: Number(def.seasonalWeights.winter)
      }
    };

    map.get(def.from).connections.push(forwardEdge);
    map.get(def.to).connections.push(reverseEdge);

    const keyB = `${def.to}->${def.from}`;
    if (!seenPairs.has(keyB)) {
      seenPairs.add(keyB);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}

function runIntegrityChecks(nodes) {
  const nodeMap = new Map();

  for (const node of nodes) {
    if (nodeMap.has(node.nodeId)) {
      throw new Error(`Duplicate nodeId in validation: ${node.nodeId}`);
    }
    nodeMap.set(node.nodeId, node);
  }

  for (const node of nodes) {
    if (node.connections.length === 0) {
      throw new Error(`Node ${node.nodeId} is orphaned and has no connections`);
    }

    for (const edge of node.connections) {
      if (!edge || typeof edge !== 'object') {
        throw new Error(`Node ${node.nodeId} contains malformed connection`);
      }

      if (typeof edge.targetNodeId !== 'string' || !nodeMap.has(edge.targetNodeId)) {
        throw new Error(`Node ${node.nodeId} references missing target ${edge.targetNodeId}`);
      }

      if (!VALID_TRANSIT.has(edge.transitType)) {
        throw new Error(`Node ${node.nodeId} uses invalid transitType ${edge.transitType}`);
      }

      if (!validateSeasonalWeights(edge.seasonalWeights)) {
        throw new Error(`Node ${node.nodeId} has invalid seasonal weights for ${edge.targetNodeId}`);
      }

      const matched = nodeMap.get(edge.targetNodeId).connections.some(
        reverseEdge => reverseEdge.targetNodeId === node.nodeId
      );

      if (!matched) {
        throw new Error(`Node ${node.nodeId} is missing the reciprocal edge to ${edge.targetNodeId}`);
      }
    }
  }
}

function computeSummary(nodes) {
  const totalNodes = nodes.length;
  const totalEdges = nodes.reduce((sum, node) => sum + node.connections.length, 0);
  const averageDegree = totalNodes > 0 ? totalEdges / totalNodes : 0;
  const memorySizeKB = Buffer.byteLength(JSON.stringify(nodes), 'utf8') / 1024;

  return {
    totalNodes,
    totalEdges,
    averageDegree,
    memorySizeKB
  };
}

function printSummary(summary) {
  const leftLabelWidth = 24;
  const valueWidth = 12;
  const line = '═'.repeat(48);

  console.log('');
  console.log(line);
  console.log('TRANSIT SPINE SUMMARY'.padEnd(33));
  console.log(line);
  console.log(`${'Total Nodes'.padEnd(leftLabelWidth)} | ${String(summary.totalNodes).padStart(valueWidth)}`);
  console.log(`${'Total Edges'.padEnd(leftLabelWidth)} | ${String(summary.totalEdges).padStart(valueWidth)}`);
  console.log(`${'Average Degree'.padEnd(leftLabelWidth)} | ${summary.averageDegree.toFixed(2).padStart(valueWidth)}`);
  console.log(`${'Memory Size (KB)'.padEnd(leftLabelWidth)} | ${summary.memorySizeKB.toFixed(2).padStart(valueWidth)}`);
  console.log(line);
  console.log('');
}

function writeOutput(nodes) {
  const repoRoot = path.resolve(__dirname, '..');
  const dataDir = path.join(repoRoot, 'data');
  const outputPath = path.join(dataDir, 'globalTransitSpine.json');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(nodes, null, 2), 'utf8');
  return outputPath;
}

function main() {
  try {
    console.log('Generating medieval transit spine...');
    const graph = buildGraph();

    runIntegrityChecks(graph);

    const summary = computeSummary(graph);
    printSummary(summary);

    const outputPath = writeOutput(graph);
    console.log(`Wrote graph to ${outputPath}`);
    console.log(`Nodes: ${summary.totalNodes}`);
    console.log(`Edges: ${summary.totalEdges}`);
    console.log('Validation passed.');
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
