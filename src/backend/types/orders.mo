import Common "common";

module {
  public type FragranceId = Common.FragranceId;
  public type OrderId = Common.OrderId;
  public type Price = Common.Price;

  /// Delivery details collected at demo checkout.
  public type DeliveryDetails = {
    fullName : Text;
    email : Text;
    address : Text;
    city : Text;
    postalCode : Text;
    country : Text;
  };

  /// One requested line in a demo order.
  public type OrderItemRequest = {
    fragranceId : FragranceId;
    sizeLabel : Text;
    quantity : Nat;
  };

  /// One resolved line item in a placed demo order.
  public type LineItem = {
    fragranceId : FragranceId;
    sizeLabel : Text;
    quantity : Nat;
    lineTotal : Price;
  };

  /// A placed demo order.
  public type Order = {
    id : OrderId;
    delivery : DeliveryDetails;
    items : [LineItem];
    total : Price;
  };

  /// Failure modes for placing a demo order.
  public type OrderError = {
    #emptyOrder;
    #unknownFragrance : FragranceId;
    #unknownSize : { fragranceId : FragranceId; sizeLabel : Text };
    #invalidQuantity : { fragranceId : FragranceId; sizeLabel : Text };
  };
};
