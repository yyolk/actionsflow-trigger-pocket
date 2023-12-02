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

- `accessToken`, required, an authentication token to the desired Pocket account.
- `consumerKey`, required, the associated consumer key that the authentication was issued against.
> [!IMPORTANT]
> To obtain the `accessToken` & `consumerKey` required options, [follow the instructions below](#retrieving-your-pocket-access-token).
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

## Retrieving Your Pocket Access Token

In order to retrieve your `access_token`, you can follow these instructions or refer directly to the [getpocket developer docs on authentication](https://getpocket.com/developer/docs/authentication).

> [!TIP]
> Pocket uses different variable names in it's OAuth2 flow. YMMV with OAuth developer tools. It's simpler to avoid using them and following manual instructions using `curl` below.

> [!NOTE]
> Pocket does not describe any method to refresh the token. In all likelihood the token is valid until the user (you) remove the app from your Pocket account. If the obtained `access_token` expires (from a TTL expiry) you will need to obtain it again. Follow the same instructions for doing so.

> [!IMPORTANT]
> If you don't authorize the `request_token` before the timeout (Step 3), start over. If you don't request the `access_token` before the timeout (Step 5), start over. Recommend use of an opened text editor with all commands so you can quickly edit the URL or command and then use it, so Pocket doesn't invalidate the flow for timing out.


1. **Obtain a platform consumer key.**
  - Set up a developer app at https://getpocket.com/developer/apps/new if you haven't already.
  - Set `redirect_uri` to `http://localhost:31337` or obtain a new hook from `https://webhook.site`, this is unimportant, we will manually fetch the `access_token` from the auth endpoint in the next steps.
  - Note the `consumer_key` and `redirect_uri` from this application for the next steps.

2. **Obtain a request token.**
  - Use the following `curl` command to obtain a request token:

        curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{
          "consumer_key": "1234-abcd1234abcd1234abcd1234", 
          "redirect_uri": "http://localhost:31337"
        }' \
        https://getpocket.com/v3/oauth/request
      
    You'll receive a response like:

        code=dcba4321-dcba-4321-dcba-4321dc

3. **Construct your authorize request URL.**
  - Using the following template, fill in `YOUR_REQUEST_TOKEN` & `YOUR_REDIRECT_URI`:

        https://getpocket.com/auth/authorize?request_token=YOUR_REQUEST_TOKEN&redirect_uri=YOUR_REDIRECT_URI

4. **Open the URL in a web browser.**
  - Authorize the application, logging in to your account if necessary.
  - Once authorized, you'll be redirected.

> [!TIP]
> You don't need to let the page load if you're redirecting to a non-existant address like `http://localhost:31337`.

5. **Convert the authorized request token into an access token.**
  - Once authorized, the `request_token` can be used to retrieve your user's `access_token`.
  - Use the following `curl` command to retrieve it:

        curl -X POST \
        -H 'Content-Type: application/json' \
        -d '
        {
            "consumer_key": "1234-abcd1234abcd1234abcd1234",
            "code": "dcba4321-dcba-4321-dcba-4321dc"
        }' \
        https://getpocket.com/v3/oauth/authorize

      You'll receive a successful response like:

        {"access_token":"5678defg-5678-defg-5678-defg56","username":"pocketuser"}

      Note your authorized `access_token`.

6. **Add secrets to your Actionsflow repository.**
> [!WARNING]
> Anyone with the `access_token` and `consumer_key` will have write access to Pocket account. 
  - Make new secrets on your Actionsflow repository under *Secrets and Variables* for *Actions* or add the path `/settings/secrets/actions` to the base URL of your repository like:

        https://github.com/{user}/{repo}/settings/secrets/actions

  - Recommend creating secrets with the names:

        POCKET_ACCESS_TOKEN
        POCKET_CONSUMER_KEY


  - After creation, access the secrets like in [**Usage**](#usage):

        accessToken: ${{ secrets.POCKET_ACCESS_TOKEN }}
        consumerKey: ${{ secrets.POCKET_CONUMSER_KEY }}

7. **You're done!**
  - You can now `pocket` trigger the necessary `accessToken` and `consumerKey` in your [Actionsflows](https://github.com/actionsflow/actionsflow).
