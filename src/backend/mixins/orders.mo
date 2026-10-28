import Types "../types/orders";
import Common "../types/common";
import OrdersLib "../lib/orders";
import Result "mo:core/Result";

mixin () {
  /// Demo order counter. Transient: the demo checkout does not require order
  /// ids to survive a canister upgrade.
  transient var nextOrderId : Common.OrderId = 1;

  /// Place a demo order from the supplied delivery details and requested items.
  public shared ({ caller }) func placeOrder(
    delivery : Types.DeliveryDetails,
    items : [Types.OrderItemRequest],
  ) : async Result.Result<Types.Order, Types.OrderError> {
    ignore caller;
    switch (OrdersLib.placeOrder(nextOrderId, delivery, items)) {
      case (#err(error)) { #err(error) };
      case (#ok(order)) {
        nextOrderId := nextOrderId + 1;
        #ok(order);
      };
    };
  };
};
