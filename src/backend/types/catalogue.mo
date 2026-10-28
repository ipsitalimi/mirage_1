import Common "common";

module {
  public type FragranceId = Common.FragranceId;
  public type Price = Common.Price;

  /// A selectable bottle size for a fragrance.
  public type Size = {
    sizeLabel : Text;
    price : Price;
  };

  /// A fragrance in the MIRAGE catalogue.
  public type Fragrance = {
    id : FragranceId;
    name : Text;
    tagline : Text;
    description : Text;
    notes : [Text];
    sizes : [Size];
  };
};
