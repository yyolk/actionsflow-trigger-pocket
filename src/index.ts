import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";
import { PocketRetrieveResponse } from "pocket-sdk-typescript";


export default class Pocket implements ITriggerClassType {
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;   
  }
  options: ITriggerOptions = {};
  helpers: IHelpers;
  async run(): Promise<AnyObject[]> {
    const { authToken, consumerKey } = this.options as {
      authToken?: string;
      consumerKey?: string;
    };
    if (!authToken) {
      throw new Error("Missing param authToken!");
    }
    if (!consumerKey) {
      throw new Error("Missing param consumerKey!");
    }

    // Calculate `now()` minus 25 hours as seconds.
    // timestamp_in_seconds - 90_000
    // 90_000s = (25 h) as seconds = (60s * 60m * 25h)s
    const nowMinus25HoursTimestamp = Math.floor(Date.now() / 1000) - (90_000);
    const response = await new (
      // I could've probably just did the HTTP call without figuring this out, and saved much more time.
      // It's a learning experience, I think the next trigger I write, will contain all necessary logic.
      // Especially if it's ultimately just a HTTP request and forming data.
      //
      // This is necessary for the dependency call tree expecting CommonJS and this library being ESM.
      // See also the package.scripts.buildProd from package.json for the minor structural change 
      // accomplished with sed and echo commandsthat's required to make it work.
      // In my testing, the full path to sdk.js (including '.js') was always required when called from `actionsflow build`.
      await import("pocket-sdk-typescript/dist/lib/sdk.js").then(({default: PocketSDK}) => PocketSDK)
      )(consumerKey)
      .getItems(authToken, {
        since: nowMinus25HoursTimestamp,
        detailType: "complete",
      });
    return this._getItems(response);
  }
  _getItems(response: PocketRetrieveResponse): AnyObject[] {
    const items: AnyObject[] = Object.keys(response.list).map(key => {
        return { 
          ...response.list[key],
          // Convenience to work with tags as an array of strings and make sure it exists as a property.
          tags: Object.keys(response.list[key].tags ?? {}),
        }
    });
    return items;
  }
  getItemKey(item: AnyObject): string {
    if (item.item_id) return item.item_id as string;
    return this.helpers.createContentDigest(item);
  }
}
