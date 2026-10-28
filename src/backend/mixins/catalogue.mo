import Types "../types/catalogue";
import CatalogueLib "../lib/catalogue";

mixin () {
  /// Return every fragrance in the catalogue.
  public query func listFragrances() : async [Types.Fragrance] {
    CatalogueLib.listFragrances();
  };

  /// Return a single fragrance by id, or null when it does not exist.
  public query func getFragrance(id : Types.FragranceId) : async ?Types.Fragrance {
    CatalogueLib.getFragrance(id);
  };
};
