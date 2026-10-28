import Types "../types/catalogue";

module {
  /// The MIRAGE catalogue seed. Static, deterministic data so every page reads
  /// the same fragrances, sizes and prices.
  let seed : [Types.Fragrance] = [
    {
      id = 1;
      name = "NOCTURNE";
      tagline = "A wound that never closes.";
      description = "Smoke over cold stone. A single crimson bloom opening in the dark, its petals bruised and wet. Worn close to the skin, it reads as a secret kept badly.";
      notes = ["Black Plum", "Incense", "Smoked Woods"];
      sizes = [
        { sizeLabel = "30 ML"; price = 180 },
        { sizeLabel = "50 ML"; price = 260 },
        { sizeLabel = "100 ML"; price = 420 },
      ];
    },
    {
      id = 2;
      name = "VESPER";
      tagline = "The hour after the last light.";
      description = "An amber that behaves like a memory. Warm resin dissolving into salt and skin, then a long mineral tail that refuses to leave the room.";
      notes = ["Amber", "Sea Salt", "Skin Musk"];
      sizes = [
        { sizeLabel = "30 ML"; price = 195 },
        { sizeLabel = "50 ML"; price = 285 },
        { sizeLabel = "100 ML"; price = 460 },
      ];
    },
    {
      id = 3;
      name = "HALO";
      tagline = "A crown of static.";
      description = "Bright, almost clinical, then wrong. Aldehydes over black tea and a metallic shimmer that hums at the edge of the nose like a screen left on.";
      notes = ["Aldehyde", "Black Tea", "Iris", "Cold Metal"];
      sizes = [
        { sizeLabel = "30 ML"; price = 210 },
        { sizeLabel = "50 ML"; price = 300 },
        { sizeLabel = "100 ML"; price = 480 },
      ];
    },
    {
      id = 4;
      name = "SERAPH";
      tagline = "Six wings, all of them burning.";
      description = "A white floral with a fever. Tuberose and orange blossom dragged through ash and honey until the sweetness turns animal and the light goes out.";
      notes = ["Tuberose", "Orange Blossom", "Ash", "Honey"];
      sizes = [
        { sizeLabel = "30 ML"; price = 225 },
        { sizeLabel = "50 ML"; price = 320 },
        { sizeLabel = "100 ML"; price = 510 },
      ];
    },
    {
      id = 5;
      name = "OBSIDIAN";
      tagline = "Black glass, held to the light.";
      description = "The house signature, stripped to its bones. Oud and birch tar over a cold violet, sharp and reflective, with nothing soft to hold on to.";
      notes = ["Black Pepper", "Vetiver", "Mineral Accord"];
      sizes = [
        { sizeLabel = "30 ML"; price = 240 },
        { sizeLabel = "50 ML"; price = 340 },
        { sizeLabel = "100 ML"; price = 540 },
      ];
    },
  ];

  /// Return every fragrance in the catalogue.
  public func listFragrances() : [Types.Fragrance] {
    seed;
  };

  /// Return a single fragrance by id, or null when it does not exist.
  public func getFragrance(id : Types.FragranceId) : ?Types.Fragrance {
    seed.find(func(fragrance) = fragrance.id == id);
  };
};
