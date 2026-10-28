import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import CatalogueApi "mixins/catalogue-api";
import OrdersApi "mixins/orders-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include CatalogueApi();
  include OrdersApi();
  include ApiDocMixin();
  include Expose({ entities = [] });
};
