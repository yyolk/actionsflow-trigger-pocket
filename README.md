# `@actionsflow/trigger-pocket`

This is an [Actionsflow](https://github.com/actionsflow/actionsflow) trigger for [Pocket](https://getpocket.com).

## Install

```bash
npm i @actionsflow/trigger-pocket
```

## Usage

```yaml
on:
  pocket:
    accessToken: ${{ secrets.POCKET_ACCESS_TOKEN }}
    consumerKey: ${{ secrets.POCKET_CONSUMER_KEY }}
```

## Options

- `accessToken`, required, an authentication token to the desired Pocket account. You'll need to provision one, [follow the (TODO) instructions](#todo)
- `consumerKey`, required, the associated consumer key that the authentication was issued against.

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

* * *

> [!IMPORTANT]  
> The rest of this README has to be refactored.

* * * 

## Outputs

This trigger's outputs will be the following object.

An outputs example:

```json
{
  "id": "uniqueId",
  "title": "hello world title"
}
```

You can use the outputs like this:

```yaml
on:
  example:
    param1: value1
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          title: ${{ on.example.outputs.title }}
          id: ${{ on.example.outputs.id }}
        run: |
          echo "title: $title"
          echo "id: $id"
```
