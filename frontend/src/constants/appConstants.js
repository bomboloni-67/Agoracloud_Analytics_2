/**
 * @file appConstants.js
 * @description Centralized configuration for Topic categories, 
 * API endpoints, and UI strings.
 */

// --- TOPIC & CATEGORY CONFIGURATIONS ---
export const TOPIC_CONFIGS = {
  ['5pwe8iHQ2K6rdCEVWNf86iHewNEop5L8']: {
    categories: ['Sales', 'Inventory', 'Supplier', 'Department', 'Other'],
    rules: [
      { key: 'Sales', keywords: ['sale', 'revenue', 'sold', 'profit', 'profitable', 'gp', 'sales'] },
      { key: 'Inventory', keywords: ['stock', 'inventory', 'sku', 'on hand', 'availability', 'holding', 'hold'] },
      { key: 'Supplier', keywords: ['supplier', 'vendor'] },
      { key: 'Department', keywords: ['dept', 'department', 'category', 'division'] },
    ],
    defaultCategory: 'Other'
  },
  ['YzLRH6qyqoHMgpC6ufVb6vqDy8sdDzeZ']: {
    categories: ['Sales', 'Product', 'Store', 'Department', 'Other'],
    rules: [
      { key: 'Sales', keywords: ['sale', 'sales', 'revenue', 'profit', 'margin', 'gp',
                                  'units sold', 'quantity sold', 'transaction',
                                  'basket', 'receipt', 'turnover', 'growth'] },
      { key: 'Product', keywords: ['item', 'product', 'sku', 'article', 'model', 'brand'] },
      { key: 'Store', keywords: [ 'store', 'outlet', 'branch',
                                  'location', 'region', 'cluster',
                                  'channel'] },
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

// --- CATEGORY RULES & LIST ---
export const CATEGORY_RULES = {
    'Executive':  ['9a5232', '10022', '2242f', '37bab6'],
    'Sales':     ['bbfed','2df77','c288ec1','220ba','83725','ac744452','e0f6f'],
    'Inventory': ['f39d7', '8669e'],
    'Member':    ['6aecf09','43769a','514d9','1abef','37351','6cbf9']
  };


export const CATEGORIES = ['Executive', 'Sales', 'Inventory', 'Member', 'Self Service'];
//If user wants a category to view ALL dashbaords  ['All', 'Executive', 'Sales', 'Inventory', 'Member'];

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
  'Topics': {
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