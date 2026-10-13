import { Runtime, type Command } from "./runtime";
const runtime = new Runtime((event) => self.postMessage(event));
self.onmessage = (event: MessageEvent<Command>) => runtime.handle(event.data);
