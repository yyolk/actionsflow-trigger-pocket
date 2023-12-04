import { resolve } from "path";
import Trigger from "../index";
import { AnyObject, getTriggerConstructorParams } from "actionsflow-core";

test("test trigger run", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "pocket",
    cwd: resolve(__dirname, "fixtures"),
    workflowPath: resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      accessToken: "fakeToken",
      consumerKey: "fakeConsumerKey",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  // const result = await trigger.run();
  // This can probably be a fixture.
  const mockResponse: AnyObject = {
    list: {
      "1234567890": {
        item_id: "1234567890",
        resolved_id: "1234567890",
        given_url: "https://example.com/article",
        given_title: "Example Title 1",
        favorite: "0",
        status: "0",
        time_added: "1701128134",
        time_updated: "1701128138",
        time_read: "0",
        time_favorited: "0",
        sort_id: 0,
        resolved_title: "Example Title 1",
        resolved_url: "https://example.com/article",
        excerpt: "Lorem ipsum...",
        is_article: "1",
        is_index: "0",
        has_video: "0",
        has_image: "1",
        word_count: "100",
        lang: "en",
        time_to_read: 1,
        top_image_url: "https://example.com/article.png",
        tags: {
          tag1: {
            item_id: 1111,
            tag: "tag1",
          },
          tag2: {
            item_id: 2222,
            tag: "tag2",
          },
        },
        images: {
          "1": {
            item_id: "1",
            image_id: "image1FakeId",
            src: "article1-1.png",
            width: "900",
            height: "900",
            credit: "",
            caption: "",
          },
          "2": {
            item_id: "2",
            image_id: "image2FakeId",
            src: "article1-2.png",
            width: "900",
            height: "900",
            credit: "",
            caption: "",
          },
        },
        listen_duration_estimate: 753,
      },
      "0987654321": {
        item_id: "0987654321",
        resolved_id: "0987654321",
        given_url: "https://example.com/article2",
        given_title: "Example Title 2",
        favorite: "0",
        status: "0",
        time_added: "1701126134",
        time_updated: "1701126138",
        time_read: "0",
        time_favorited: "0",
        sort_id: 0,
        resolved_title: "Example Title 2",
        resolved_url: "https://example.com/article2",
        excerpt: "Lorem ipsum...",
        is_article: "1",
        is_index: "0",
        has_video: "0",
        has_image: "1",
        word_count: "100",
        lang: "en",
        time_to_read: 1,
        top_image_url: "https://example.com/article2.png",
        tags: {
          tag3: {
            item_id: 3333,
            tag: "tag3",
          },
          tag4: {
            item_id: 4444,
            tag: "tag4",
          },
        },
        images: {
          "1": {
            item_id: "1",
            image_id: "image1FakeId",
            src: "article2.png",
            width: "900",
            height: "900",
            credit: "",
            caption: "",
          },
        },
        listen_duration_estimate: 753,
      },
    },
    complete: 1,
    status: 1,
  };
  const triggerResults = await trigger._getItems.bind(trigger)(mockResponse);
  expect(triggerResults.length).toBe(2);
  expect(triggerResults[0].resolved_title).toBe("Example Title 1");
  expect(triggerResults[0].resolved_url).toBe("https://example.com/article");
  expect((triggerResults[0] as { tags?: any[] }).tags?.length).toBe(2);
  expect((triggerResults[0] as { tags?: any[] }).tags?.[0]).toBe("tag1");
  expect((triggerResults[0] as { tags?: any[] }).tags?.[1]).toBe("tag2");
  expect((triggerResults[1] as { tags?: any[] }).tags?.length).toBe(2);
  expect(triggerResults[1].resolved_title).toBe("Example Title 2");
});
