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
    const { accessToken, consumerKey, contentType, count, sinceHoursAgo, tag } =
      this.options as {
        accessToken?: string;
        consumerKey?: string;
        contentType?: "video" | "image" | "article";
        count?: number;
        sinceHoursAgo?: number;
        tag?: string;
      };
    if (!accessToken) {
      throw new Error("Missing param accessToken!");
    }
    if (!consumerKey) {
      throw new Error("Missing param consumerKey!");
    }
    const pocketRetrieveEndpoint = "https://getpocket.com/v3/get";

    const optionalParam = (o: AnyObject): AnyObject => {
      return !Object.values(o)[0] ? {} : o;
    };

    const params = {
      consumer_key: consumerKey,
      access_token: accessToken,
      detailType: "complete",
      // Get only items of contentType
      ...optionalParam({ contentType }),
      // Limit results to count
      ...optionalParam({ count }),
      // Limit results to sinceHoursAgo
      // (sinceHoursAgo hours) as seconds = (60 * 60 * sinceHoursAgo)
      // (Date.now() as seconds) - (sinceHoursAgo as seconds) == timeStampAsSeconds
      ...optionalParam(
        sinceHoursAgo
          ? { since: Math.floor(Date.now() / 1000) - 60 * 60 * sinceHoursAgo }
          : {}
      ),
      // Limit results to tag or _untagged_ for only untagged
      ...optionalParam({ tag }),
    };
    const response = await this.helpers.axios.post(
      pocketRetrieveEndpoint,
      params
    );
    return this._getItems(response.data);
  }
  _getItems(response: AnyObject): AnyObject[] {
    const list: AnyObject = (response as { list?: AnyObject }).list ?? {};
    const items: AnyObject[] = Object.keys(list).map((key) => {
      return {
        ...(list[key] as AnyObject),
        // Convenience to work with tags as an array of strings and make sure it exists as a property.
        tags: Object.keys(
          (list[key] as AnyObject as { tags?: AnyObject }).tags ?? {}
        ),
      };
    });
    return items;
  }
  getItemKey(item: AnyObject): string {
    if (item.item_id) return item.item_id as string;
    return this.helpers.createContentDigest(item);
  }
}
