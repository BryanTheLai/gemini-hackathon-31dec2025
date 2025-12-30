export const MENU_ITEMS = [
  {
    category: "Burgers",
    items: [
      { 
        name: "Gemini Classic", 
        price: 5.99, 
        description: "1/4lb Grass-fed Beef, Aged Cheddar, Heirloom Tomato, Butter Lettuce, Secret Gemini Sauce", 
        nutrition: "650 Cal | 35g Protein",
        icon: "🍔" 
      },
      { 
        name: "Double Nebula", 
        price: 7.99, 
        description: "Two 1/4lb Beef Patties, Double Smoked Bacon, Crispy Onion Rings, Pepper Jack Cheese", 
        nutrition: "980 Cal | 58g Protein",
        icon: "🍔" 
      },
    ],
  },
  {
    category: "Sides",
    items: [
      { 
        name: "Asteroid Fries", 
        price: 2.99, 
        description: "Hand-cut Russet Potatoes, Himalayan Sea Salt, Rosemary Infusion", 
        nutrition: "320 Cal | 4g Protein",
        icon: "🍟" 
      },
      { 
        name: "Onion Rings", 
        price: 3.49, 
        description: "Jumbo Sweet Onions, Craft Beer Batter, Panko Crust", 
        nutrition: "410 Cal | 5g Protein",
        icon: "🧅" 
      },
    ],
  },
  {
    category: "Drinks",
    items: [
      { 
        name: "Galaxy Shake", 
        price: 4.99, 
        description: "A2 Organic Milk, Madagascar Vanilla Bean, Edible Silver Stars", 
        nutrition: "520 Cal | 8g Protein",
        icon: "🥤" 
      },
      { 
        name: "Nebula Soda", 
        price: 1.99, 
        description: "Sparkling Mineral Water, Natural Black Cherry Extract", 
        nutrition: "140 Cal | 0g Protein",
        icon: "🥤" 
      },
    ],
  },
]

export const getPriceByName = (name: string): number => {
  for (const category of MENU_ITEMS) {
    const item = category.items.find(i => i.name.toLowerCase() === name.toLowerCase())
    if (item) return item.price
  }
  return 0
}
