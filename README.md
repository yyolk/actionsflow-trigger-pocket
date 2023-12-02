# `@actionsflow/trigger-pocket`

This is an [Actionsflow](https://github.com/actionsflow/actionsflow) trigger for [Pocket](https://getpocket.com).

## Install

```bash
# npm i --save-dev @actionsflow/trigger-pocket
npm i --save-dev https://github.com/yyolk/actionsflow-trigger-pocket/releases/download/1.1.0/actionsflow-trigger-pocket-1.1.0.tgz
```
> See [#2](https://github.com/yyolk/actionsflow-trigger-pocket/issues/2), for reasoning around using installation using the `.tgz` release.

## Usage

```yaml
on:
  pocket:
    accessToken: ${{ secrets.POCKET_ACCESS_TOKEN }}
    consumerKey: ${{ secrets.POCKET_CONSUMER_KEY }}
    count: 10
    contentType: article
    sinceHoursAgo: 25
    tag: ai
```

## Options

- `accessToken`, required, an authentication token to the desired Pocket account. You'll need to provision one, [follow the (TODO) instructions](#todo).
- `consumerKey`, required, the associated consumer key that the authentication was issued against.
- `contentType`, optional, one of three values are allowed: 
  - `article` - only return articles
  - `video` - only return videos or articles with embedded videos
  - `image` - only return images
- `count`, optional, the amount of entries to limit the fetch to
- `sinceHoursAgo`, optional, since how many hours ago to limit the fetch to
- `tag`, optional, only fetch items with *tag*, set to `_untagged_` to fetch untagged

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.


## Outputs

This trigger's outputs will be the following object.

An outputs example:

```jsonc
{
  "item_id": "123456789",  //  A unique identifier matching the saved item. This is the deduplication key.
  "resolved_id": "123456789",  // A unique identifier similar to the item_id but is unique to the actual url of the saved item. The resolved_id identifies unique urls.
  "given_url": "https://example.com/article",  // The actual url that was saved with the item. This url should be used if the user wants to view the item.
  "resolved_url": "https://example.com/articles/article",  // The final url of the item. For example if the item was a shortened bit.ly link, this will be the actual article the url linked to.
  "given_title": "The title that was saved along with the item.",
  "resolved_title": "The title that Pocket found for the item when it was parsed.",
  "favorite": "0",  // "0" or "1" if the tiem is favorited
  "status": "0",  // "0", "1", "2" - 1 if the item is archived - 2 if the item should be deleted
  "excerpt": "The first few lines of the item (articles only)",
  "is_article": "1",  // "0" or "1" - 1 if the item is an article
  "has_image": "0",  // "0", "1", or "2" - 1 if the item has images in it - 2 if the item is an image
  "has_video": "0",  // "0", "1", or "2" - 1 if the item has videos in it - 2 if the item is a video
  "word_count": "1337",  // How many words are in the article
  "tags": [
    "tag1", "tag2"
  ],  // Reshaped tags from response to simplify parsing.
  "time_added": "1701082956",  // Timestamp of time added (unit=seconds)
  "time_updated": "1701082977",  // Timestamp of time updated (unit=seconds)
  "time_favorited": "0",  // Timestamp of time when item was favorited (if favorite), 0 if never
  "time_read": "0",  // Timestamp of time when item was read (if read, in archive), 0 if never
  "image": {  // The main image Pocket associates with the article
    "item_id": "12345678901234",
    "src": "https://placekitten.com/500",
    "width": "500",
    "height": "500"
  },
  "images": {  // A JSON object listing all of the images associated with the item
    "1": {
      "item_id": "12345678901234",
      "src": "..."
      },
      "2": {}
    },
  "videos": {"1": {}},  // A JSON object listing all of the images associated with the item
  "authors": {"1": {}} // A JSON object listing all of the authors associated with the item
}
```

> See [getpocket `v3/retrieve` docs](https://getpocket.com/developer/docs/v3/retrieve) for full explanation of each property available in the reshaped response.

You can use the outputs like this:

```yaml
on:
  pocket:
    accessToken: ${{ secrets.POCKET_ACCESS_TOKEN }}
    consumerKey: ${{ secrets.POCKET_CONSUMER_KEY }}
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{on.pocket.outputs.given_title}}
          url: ${{on.pocket.outputs.given_url}}
          excerpt: ${{on.pocket.outputs.excerpt}}
          tags: ${{join(on.pocket.outputs.tags, ', ')}}
        run: |
          echo title: $title
          echo url: $url
          echo excerpt: $excerpt
          echo tags: $tags
```
