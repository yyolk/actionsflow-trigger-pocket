import { resolve } from "path";
import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";

test("test trigger run", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "pocket",
    cwd: resolve(__dirname, "fixtures"),
    workflowPath: resolve(__dirname, "fixtures/workflows/workflow.yml"),
    options: {
      authToken: "fakeAuthToken",
      consumerKey: "fakeConsumerKey",
    },
  });
  const trigger = new Trigger(triggerConstructorParams);
  // const result = await trigger.run();
  // This can probably be a fixture.
  const mockResponse = {
    "1234567890": {
      item_id: '1234567890',
      resolved_id: '1234567890',
      given_url: 'https://example.com/article',
      given_title: 'Example Title 1',
      favorite: '0',
      status: '0',
      time_added: '1701128134',
      time_updated: '1701128138',
      time_read: '0',
      time_favorited: '0',
      sort_id: 0,
      resolved_title: 'Example Title 1',
      resolved_url: 'https://example.com/article',
      excerpt: 'Lorem ipsum...',
      is_article: '1',
      is_index: '0',
      has_video: '0',
      has_image: '1',
      word_count: '100',
      lang: 'en',
      time_to_read: 1,
      top_image_url: 'https://example.com/article.png',
      tags: {
        "tag1" : {
          "fake": "fake"
        },
        "tag2": {
          "fake": "fake"
        }
      },
      image: {
        item_id: '12345',
        src: 'https://example.com/article.png',
        width: '640',
        height: '404'
      },
      images: { '1': {"fake": "fake"}, '2': {"fake": "fake"}, '3': {"fake": "fake"} },
      listen_duration_estimate: 753
    },
    "0987654321": {
      item_id: '0987654321',
      resolved_id: '0987654321',
      given_url: 'https://example.com/article2',
      given_title: 'Example Title 2',
      favorite: '0',
      status: '0',
      time_added: '1701126134',
      time_updated: '1701126138',
      time_read: '0',
      time_favorited: '0',
      sort_id: 0,
      resolved_title: 'Example Title 2',
      resolved_url: 'https://example.com/article2',
      excerpt: 'Lorem ipsum...',
      is_article: '1',
      is_index: '0',
      has_video: '0',
      has_image: '1',
      word_count: '100',
      lang: 'en',
      time_to_read: 1,
      top_image_url: 'https://example.com/article2.png',
      tags: {
        "tag3" : {
          "fake": "fake"
        },
        "tag4": {
          "fake": "fake"
        }
      },
      image: {
        item_id: '54321',
        src: 'https://example.com/article2.png',
        width: '640',
        height: '404'
      },
      images: { '1': {"fake": "fake"}, '2': {"fake": "fake"}, '3': {"fake": "fake"} },
      listen_duration_estimate: 753
    }
  }
  const triggerResults = await trigger._getItems.bind(trigger)(mockResponse);
  expect(triggerResults.length).toBe(2);
  expect(triggerResults[0].resolved_title).toBe("Example Title 1");
  expect(triggerResults[0].resolved_url).toBe("https://example.com/article");
  expect(triggerResults[0].tags.length).toBe(2);
  expect(triggerResults[0].tags[0]).toBe("tag1");
  expect(triggerResults[0].tags[1]).toBe("tag2");
  expect(triggerResults[1].tags.length).toBe(2);
  expect(triggerResults[0].resolved_title).toBe("Example Title 2");
});
