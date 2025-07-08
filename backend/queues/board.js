import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { emailQ, cleanQ, documentQueue } from "../queues/simple.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQ),
    new BullMQAdapter(cleanQ),
    new BullMQAdapter(documentQueue),
  ],
  serverAdapter,
});

export { serverAdapter };
