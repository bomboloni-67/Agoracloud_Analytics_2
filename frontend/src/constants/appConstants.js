/**
 * @file appConstants.js
 * @description Centralized configuration for Topic categories, 
 * API endpoints, and UI strings.
 */

// --- TOPIC & CATEGORY CONFIGURATIONS ---
export const TOPIC_CONFIGS = {
  [import.meta.env.VITE_INV_B_ITM_ID]: {
    categories: ['Sales', 'Inventory', 'Supplier', 'Department', 'Other'],
    rules: [
      { key: 'Sales', keywords: ['sale', 'revenue', 'sold', 'profit', 'profitable', 'gp', 'sales'] },
      { key: 'Inventory', keywords: ['stock', 'inventory', 'sku', 'on hand', 'availability', 'holding', 'hold'] },
      { key: 'Supplier', keywords: ['supplier', 'vendor'] },
      { key: 'Department', keywords: ['dept', 'department', 'category', 'division'] },
    ],
    defaultCategory: 'Other'
  },
  'DEFAULT': {
    categories: ['What', 'Why', 'Who', 'When', 'Other'],
    rules: [
      { key: 'What', keywords: ['what'] },
      { key: 'Why', keywords: ['why'] },
      { key: 'Who', keywords: ['who'] },
      { key: 'When', keywords: ['when', 'time', 'date', 'month', 'year'] },
    ],
    defaultCategory: 'Other'
  }
};

// --- API ENDPOINTS ---
// Using import.meta.env to pull from your .env file
export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

// --- UI TEXT CONSTANTS ---
export const PAGE_METADATA = {
  'Dashboards': { 
    h2: 'Dashboard Gallery', 
    p: 'Select a specialized visualization card to begin' 
  },
  'Settings': { 
    h2: 'Account Settings', 
    p: 'Manage your profile and security preferences' 
  },
  'Stories': { 
    h2: 'Data Stories', 
    p: 'Create exciting stories from your data insights' 
  },
  'TOPICS': {
    h2: 'Generative Insights',
    p: 'Ask questions about your data in plain English'
  }
};

// --- TAB IDENTIFIERS ---
export const TABS = {
  TOPICS: 'Topics',
  DASHBOARDS: 'Dashboards',
  STORIES: 'Stories',
  SETTINGS: 'Settings'
};