export default {
  animal: {
    enrichFields: ["synonyms", "tags", "relations"],
    synonyms: {
      cat: ["feline", "housecat"],
      dog: ["canine", "puppy"]
    },
    tags: {
      cat: ["mammal", "pet"],
      dog: ["mammal", "pet"]
    },
    relations: {
      cat: [{ type: "location", name: "Ba Sing Se" }],
      dog: [{ type: "location", name: "Omashu" }]
    },
    defaults: {
      synonyms: [],
      tags: [],
      relations: []
    }
  },
  food: {
    enrichFields: ["synonyms", "tags", "relations"],
    synonyms: {
      rice: ["grain", "staple food"]
    },
    tags: {
      rice: ["vegetarian", "gluten-free"]
    },
    relations: {
      rice: [{ type: "location", name: "Ba Sing Se" }]
    },
    defaults: {
      synonyms: [],
      tags: [],
      relations: []
    }
  }
}; 