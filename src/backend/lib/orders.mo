import Types "../types/orders";
import Common "../types/common";
import CatalogueTypes "../types/catalogue";
import CatalogueLib "catalogue";
import Result "mo:core/Result";

module {
  public type Order = Types.Order;
  public type OrderError = Types.OrderError;
  public type OrderItemRequest = Types.OrderItemRequest;
  public type LineItem = Types.LineItem;
  public type DeliveryDetails = Types.DeliveryDetails;

  /// Resolve one requested line into a priced line item, or report the first
  /// reason the request is invalid. Prices come from the shared catalogue so
  /// order totals always match the catalogue.
  func resolveItem(request : OrderItemRequest) : Result.Result<LineItem, OrderError> {
    switch (CatalogueLib.getFragrance(request.fragranceId)) {
      case null { #err(#unknownFragrance(request.fragranceId)) };
      case (?fragrance) {
        switch (findSize(fragrance, request.sizeLabel)) {
          case null {
            #err(#unknownSize({ fragranceId = request.fragranceId; sizeLabel = request.sizeLabel }));
          };
          case (?size) {
            if (request.quantity == 0) {
              #err(#invalidQuantity({ fragranceId = request.fragranceId; sizeLabel = request.sizeLabel }));
            } else {
              #ok({
                fragranceId = request.fragranceId;
                sizeLabel = request.sizeLabel;
                quantity = request.quantity;
                lineTotal = size.price * request.quantity;
              });
            };
          };
        };
      };
    };
  };

  func findSize(fragrance : CatalogueTypes.Fragrance, sizeLabel : Text) : ?CatalogueTypes.Size {
    fragrance.sizes.find(func size = size.sizeLabel == sizeLabel);
  };

  /// Place a demo order: validate every requested line, resolve its price from
  /// the shared catalogue, and return the created order with its total.
  public func placeOrder(
    id : Common.OrderId,
    delivery : DeliveryDetails,
    items : [OrderItemRequest],
  ) : Result.Result<Order, OrderError> {
    if (items.size() == 0) {
      return #err(#emptyOrder);
    };

    let resolved = items.map(func request = resolveItem(request));

    var failure : ?OrderError = null;
    for (outcome in resolved.values()) {
      switch (outcome) {
        case (#err(error)) {
          if (failure == null) { failure := ?error };
        };
        case (#ok(_)) {};
      };
    };

    switch (failure) {
      case (?error) { #err(error) };
      case null {
        let lineItems = resolved.map(
          func(outcome) {
            switch (outcome) {
              case (#ok(item)) { item };
              case (#err(_)) { { fragranceId = 0; sizeLabel = ""; quantity = 0; lineTotal = 0 } };
            };
          }
        );
        let total = lineItems.foldLeft(0, func(acc, item) = acc + item.lineTotal);
        #ok({ id; delivery; items = lineItems; total });
      };
    };
  };
};
