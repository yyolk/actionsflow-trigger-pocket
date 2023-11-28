import {
  ITriggerClassType,
  ITriggerContructorParams,
  IHelpers,
  AnyObject,
  ITriggerOptions,
} from "actionsflow-core";


export default class Pocket implements ITriggerClassType {
  constructor({ helpers, options }: ITriggerContructorParams) {
    this.options = options;
    this.helpers = helpers;   
  }
  options: ITriggerOptions = {};
  helpers: IHelpers;
  async run(): Promise<AnyObject[]> {
    const { accessToken, consumerKey } = this.options as {
      accessToken?: string;
      consumerKey?: string;
    };
    if (!accessToken) {
      throw new Error("Missing param accessToken!");
    }
    if (!consumerKey) {
      throw new Error("Missing param consumerKey!");
    }

    // Calculate `now()` minus 25 hours as seconds.
    // timestamp_in_seconds - 90_000
    // 90_000s = (25 h) as seconds = (60s * 60m * 25h)s
    const nowMinus25HoursTimestamp = Math.floor(Date.now() / 1000) - (90_000);
    const response = await this.helpers.axios.post("https://getpocket.com/v3/get", {
      consumer_key: consumerKey,
      access_token: accessToken,
      detailType: "complete",
      since: nowMinus25HoursTimestamp,
    })
    return this._getItems(response.data);
  }
  _getItems(response: AnyObject): AnyObject[] {
    const list: AnyObject = (response as { list?: AnyObject }).list ?? {}
    const items: AnyObject[] = Object.keys(list).map(key => {
        return { 
          ...list[key] as AnyObject,
          // Convenience to work with tags as an array of strings and make sure it exists as a property.
          tags: Object.keys(((list[key] as AnyObject) as { tags?: AnyObject}).tags ?? {}),

        }
    });
    return items;
  }
  getItemKey(item: AnyObject): string {
    if (item.item_id) return item.item_id as string;
    return this.helpers.createContentDigest(item);
  }
}
