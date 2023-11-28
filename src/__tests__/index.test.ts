import { resolve } from "path";
import Trigger from "../index";
import { getTriggerConstructorParams } from "actionsflow-core";

test("test trigger run", async () => {
  const triggerConstructorParams = await getTriggerConstructorParams({
    name: "pocket",
    cwd: resolve(__dirname, "fixtures"),
    workflowPath: resolve(__dirname, "fixtures/workflows/workflow.yml"),
  });
  const trigger = new Trigger(triggerConstructorParams);
  const result = await trigger.run();
  // TODO: mock data
  // expect(result.length).toBe(2);
  expect(result.length).toBe(0);
});
