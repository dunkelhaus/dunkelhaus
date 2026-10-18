import { mount } from "svelte";
import "../styles.css";
import LabIndex from "../lib/LabIndex.svelte";

const app = mount(LabIndex, { target: document.getElementById("app")! });

export { app };
