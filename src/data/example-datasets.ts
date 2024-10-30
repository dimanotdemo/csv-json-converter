interface ExampleDataset {
  name: string;
  data: Record<string, string>[];
  transform: (item: Record<string, string>) => unknown;
}

export const EXAMPLE_DATASETS: ExampleDataset[] = [
  {
    name: 'Products',
    data: [
      { id: "1", product: "Laptop Pro", price: "$1299.99", stock: "15", category: "Electronics" },
      { id: "2", product: "Wireless Mouse", price: "$49.99", stock: "42", category: "Accessories" },
      { id: "3", product: "USB-C Cable", price: "$19.99", stock: "108", category: "Accessories" },
      { id: "4", product: "4K Monitor", price: "$599.99", stock: "23", category: "Electronics" },
      { id: "5", product: "Mechanical Keyboard", price: "$159.99", stock: "67", category: "Electronics" },
      { id: "6", product: "Laptop Stand", price: "$39.99", stock: "91", category: "Accessories" }
    ],
    transform: (item) => ({
      id: parseInt(item.id),
      product: item.product,
      price: parseFloat(item.price.replace('$', '')),
      stock: parseInt(item.stock),
      category: item.category.toLowerCase()
    })
  },
  {
    name: 'Users',
    data: [
      { user_id: "1001", name: "John Smith", email: "john@example.com", role: "Admin", last_login: "2024-03-01" },
      { user_id: "1002", name: "Sarah Johnson", email: "sarah@example.com", role: "Editor", last_login: "2024-02-28" },
      { user_id: "1003", name: "Mike Brown", email: "mike@example.com", role: "Viewer", last_login: "2024-03-02" },
      { user_id: "1004", name: "Emma Wilson", email: "emma@example.com", role: "Editor", last_login: "2024-03-01" },
      { user_id: "1005", name: "David Lee", email: "david@example.com", role: "Admin", last_login: "2024-02-29" },
      { user_id: "1006", name: "Lisa Anderson", email: "lisa@example.com", role: "Viewer", last_login: "2024-03-02" }
    ],
    transform: (item) => ({
      userId: parseInt(item.user_id),
      name: item.name,
      email: item.email,
      role: item.role.toLowerCase(),
      lastLogin: item.last_login
    })
  },
  {
    name: 'Orders',
    data: [
      { order_id: "ORD001", customer: "Alice Cooper", items: "3", total: "$156.99", status: "Shipped" },
      { order_id: "ORD002", customer: "Bob Dylan", items: "1", total: "$89.99", status: "Processing" },
      { order_id: "ORD003", customer: "Charlie Brown", items: "2", total: "$234.50", status: "Delivered" },
      { order_id: "ORD004", customer: "Diana Ross", items: "4", total: "$445.00", status: "Processing" },
      { order_id: "ORD005", customer: "Elvis Presley", items: "2", total: "$178.50", status: "Shipped" },
      { order_id: "ORD006", customer: "Frank Sinatra", items: "1", total: "$99.99", status: "Pending" }
    ],
    transform: (item) => ({
      orderId: item.order_id,
      customer: item.customer,
      itemCount: parseInt(item.items),
      total: parseFloat(item.total.replace('$', '')),
      status: item.status.toLowerCase()
    })
  },
  {
    name: 'Rick and Morty Characters',
    data: [
      { char_id: "1", name: "Rick Sanchez", species: "Human", status: "Alive", location: "Earth (C-137)", episodes: "51" },
      { char_id: "2", name: "Morty Smith", species: "Human", status: "Alive", location: "Earth (C-137)", episodes: "51" },
      { char_id: "3", name: "Summer Smith", species: "Human", status: "Alive", location: "Earth (Replacement)", episodes: "42" },
      { char_id: "4", name: "Beth Smith", species: "Human", status: "Alive", location: "Earth (Replacement)", episodes: "42" },
      { char_id: "5", name: "Jerry Smith", species: "Human", status: "Alive", location: "Earth (Replacement)", episodes: "37" },
      { char_id: "6", name: "Abadango Cluster Princess", species: "Alien", status: "Alive", location: "Abadango", episodes: "1" },
      { char_id: "7", name: "Mr. Meeseeks", species: "Humanoid", status: "Unknown", location: "Mr. Meeseeks Box", episodes: "2" },
      { char_id: "8", name: "Pickle Rick", species: "Pickle", status: "Alive", location: "Earth (C-137)", episodes: "1" }
    ],
    transform: (item) => ({
      id: parseInt(item.char_id),
      name: item.name,
      species: item.species.toLowerCase(),
      status: item.status.toLowerCase(),
      location: item.location,
      episodeCount: parseInt(item.episodes),
      isMainCharacter: parseInt(item.episodes) > 40
    })
  },
  {
    name: 'Pokémon',
    data: [
      { dex_num: "025", name: "Pikachu", type: "Electric", hp: "35", attack: "55", defense: "40", is_legendary: "false" },
      { dex_num: "001", name: "Bulbasaur", type: "Grass/Poison", hp: "45", attack: "49", defense: "49", is_legendary: "false" },
      { dex_num: "006", name: "Charizard", type: "Fire/Flying", hp: "78", attack: "84", defense: "78", is_legendary: "false" },
      { dex_num: "150", name: "Mewtwo", type: "Psychic", hp: "106", attack: "110", defense: "90", is_legendary: "true" },
      { dex_num: "094", name: "Gengar", type: "Ghost/Poison", hp: "60", attack: "65", defense: "60", is_legendary: "false" }
    ],
    transform: (item) => ({
      id: parseInt(item.dex_num),
      name: item.name,
      types: item.type.toLowerCase().split('/'),
      stats: {
        hp: parseInt(item.hp),
        attack: parseInt(item.attack),
        defense: parseInt(item.defense)
      },
      isLegendary: item.is_legendary === 'true',
      totalPower: parseInt(item.hp) + parseInt(item.attack) + parseInt(item.defense)
    })
  },
  {
    name: 'Star Wars Ships',
    data: [
      { ship_id: "1", name: "Millennium Falcon", class: "Light freighter", speed: "75", crew: "4", hyperdrive: "0.5" },
      { ship_id: "2", name: "X-wing", class: "Starfighter", speed: "100", crew: "1", hyperdrive: "1.0" },
      { ship_id: "3", name: "Star Destroyer", class: "Capital ship", speed: "60", crew: "47060", hyperdrive: "2.0" },
      { ship_id: "4", name: "TIE Fighter", class: "Starfighter", speed: "100", crew: "1", hyperdrive: "0" },
      { ship_id: "5", name: "Death Star", class: "Space station", speed: "10", crew: "1206293", hyperdrive: "4.0" }
    ],
    transform: (item) => ({
      id: parseInt(item.ship_id),
      name: item.name,
      class: item.class.toLowerCase(),
      specs: {
        maxSpeed: parseInt(item.speed),
        crewSize: parseInt(item.crew),
        hyperdriveRating: parseFloat(item.hyperdrive)
      },
      hasHyperdrive: parseFloat(item.hyperdrive) > 0,
      size: parseInt(item.crew) > 1000 ? 'massive' : parseInt(item.crew) > 10 ? 'large' : 'small'
    })
  },
  {
    name: 'Superhero Powers',
    data: [
      { hero_id: "1", name: "Spider-Man", powers: "Wall-crawling,Super-strength,Spider-sense", universe: "Marvel", power_level: "85" },
      { hero_id: "2", name: "Batman", powers: "Intelligence,Martial Arts,Wealth", universe: "DC", power_level: "70" },
      { hero_id: "3", name: "Superman", powers: "Flight,Super-strength,Heat vision,Invulnerability", universe: "DC", power_level: "100" },
      { hero_id: "4", name: "Iron Man", powers: "Intelligence,Flight,Energy blasts", universe: "Marvel", power_level: "85" },
      { hero_id: "5", name: "Wonder Woman", powers: "Super-strength,Flight,Combat skill", universe: "DC", power_level: "90" }
    ],
    transform: (item) => ({
      id: parseInt(item.hero_id),
      name: item.name,
      powers: item.powers.split(','),
      universe: item.universe.toUpperCase(),
      powerLevel: parseInt(item.power_level),
      powerClass: parseInt(item.power_level) >= 90 ? 'S' : 
                 parseInt(item.power_level) >= 80 ? 'A' : 
                 parseInt(item.power_level) >= 70 ? 'B' : 'C',
      numberOfPowers: item.powers.split(',').length
    })
  }
] 