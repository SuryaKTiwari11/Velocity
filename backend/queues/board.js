import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { emailQ, cleanQ, documentQueue } from "../queues/simple.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(emailQ),
    new BullMQAdapter(cleanQ),
    new BullMQAdapter(documentQueue),
  ],
  serverAdapter: serverAdapter,
});

export const adminAuth = [protect, adminOnly];

export { serverAdapter };
export default { serverAdapter, adminAuth };
