# AI TTRPG Mobile Game Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from gaming apps like Genshin Impact, Pokémon GO, and D&D Beyond, combined with modern mobile game UI patterns. The design should feel immersive and fantasy-themed while maintaining excellent mobile usability.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (fantasy gaming theme):
- Primary: 220 85% 15% (deep midnight blue)
- Secondary: 35 70% 25% (rich bronze/gold)
- Accent: 285 60% 55% (mystical purple)
- Surface: 220 25% 8% (dark charcoal)
- Text: 0 0% 95% (near white)

**Light Mode** (for accessibility):
- Primary: 220 70% 35% 
- Secondary: 35 80% 45%
- Background: 220 15% 97%

### Typography
- **Primary Font**: Inter (via Google Fonts CDN) - clean, readable for UI text
- **Display Font**: Cinzel (via Google Fonts CDN) - fantasy/medieval feel for headings and titles
- **Sizes**: text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, and 12
- Consistent padding: p-4 for cards, p-6 for main containers
- Margins: m-2 for tight spacing, m-4 for standard, m-8 for sections
- Component heights: h-12 for buttons, h-16 for input fields

### Component Library

**Navigation**:
- Bottom tab bar with 4 main sections: Character, Quest, Inventory, Chat
- Each tab uses appropriate Heroicons with fantasy context
- Active state uses accent color with subtle glow effect

**Character Sheet**:
- Card-based layout showing stats in circular progress indicators
- Health/mana bars with gradient fills (red to green for health, blue for mana)
- Equipment slots as empty/filled containers with drag targets

**Quest Interface**:
- Scroll-based quest list with priority indicators
- Expandable quest cards showing objectives and rewards
- Progress bars for multi-step quests

**AI Chat Interface**:
- Message bubbles distinguishing player vs AI (DM/NPCs)
- Large speech-to-text button at bottom center
- Swipe gestures for quick responses ("Yes", "No", "Attack", "Investigate")

**Combat UI**:
- Action cards that slide up from bottom
- Swipe directions mapped to different actions
- Dice roll animations with satisfying physics

### Gesture Controls
- **Swipe Right**: Accept/Agree actions
- **Swipe Left**: Decline/Cancel actions  
- **Swipe Up**: Access detailed view/inventory
- **Tap & Hold**: Context menus for items/abilities
- **Double Tap**: Quick use/equip items

### Visual Treatments
**Gradients**: Subtle radial gradients on cards from primary to slightly darker shade
**Shadows**: Soft drop shadows on elevated elements (cards, buttons)
**Borders**: 1px borders using secondary color for definition
**Icons**: Heroicons via CDN for UI elements, custom placeholders for D&D-specific symbols

### Mobile-First Considerations
- Thumb-friendly touch targets (minimum 44px)
- One-handed operation priority
- Clear visual feedback for all interactions
- Loading states for AI responses
- Offline capability indicators

### Immersive Elements
- Parchment-textured backgrounds for character sheets
- Subtle particle effects on spell casting
- Screen shake on critical hits (minimal, accessibility-conscious)
- Contextual background colors matching current quest environment

The design balances fantasy immersion with modern mobile usability, ensuring the complex D&D mechanics remain accessible through intuitive touch interactions.