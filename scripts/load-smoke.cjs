const Module = require("node:module");
const path = require("node:path");

const registrations = { views: [], commands: [], settings: 0, ribbons: 0 };
class Element {
  toggleClass() {}
  removeClass() {}
  empty() {}
  createEl() { return new Element(); }
  createDiv() { return new Element(); }
  createSpan() { return new Element(); }
  addClass() {}
  addEventListener() {}
  setText() {}
  setAttr() {}
}
class Plugin {
  constructor() {
    this.app = {
      vault: {
        getAbstractFileByPath: () => undefined,
        createFolder: async () => {},
        createBinary: async () => {},
        modifyBinary: async () => {},
        getMarkdownFiles: () => [],
        on: () => ({})
      },
      fileManager: {},
      metadataCache: { on: () => ({}) },
      workspace: { onLayoutReady: () => {}, getLeavesOfType: () => [], getLeaf: () => ({}) }
    };
  }
  async loadData() { return {}; }
  async saveData() {}
  registerView(type) { registrations.views.push(type); }
  addCommand(command) { registrations.commands.push(command.id); }
  addSettingTab() { registrations.settings += 1; }
  addRibbonIcon() { registrations.ribbons += 1; }
  registerEvent() {}
}
class ItemView { constructor() { this.contentEl = new Element(); } }
class Modal { constructor() { this.titleEl = new Element(); this.contentEl = new Element(); } }
class FuzzySuggestModal extends Modal {}
class PluginSettingTab { constructor() { this.containerEl = new Element(); } }
class Setting {
  setName() { return this; } setDesc() { return this; } addText() { return this; }
  addTextArea() { return this; } addDropdown() { return this; } addButton() { return this; }
  addToggle() { return this; }
}
class TFile {}
class Notice {}

const obsidianMock = {
  Plugin, ItemView, Modal, FuzzySuggestModal, PluginSettingTab, Setting, TFile, Notice,
  WorkspaceLeaf: class {}, App: class {}, Vault: class {}, FileManager: class {}, MetadataCache: class {},
  debounce: (fn) => fn,
  parseYaml: () => ({})
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "obsidian") return obsidianMock;
  return originalLoad.call(this, request, parent, isMain);
};
global.document = { body: new Element() };

(async () => {
  const exported = require(path.join(process.cwd(), "main.js"));
  const PluginClass = exported.default ?? exported;
  if (typeof PluginClass !== "function") throw new Error("Compiled bundle did not export a plugin class.");
  const plugin = new PluginClass();
  await plugin.onload();
  if (registrations.views.length !== 19) throw new Error(`Expected 19 registered views, found ${registrations.views.length}.`);
  if (registrations.commands.length < 51) throw new Error(`Expected at least 51 commands, found ${registrations.commands.length}.`);
  if (registrations.settings !== 1 || registrations.ribbons !== 1) throw new Error("Settings tab or ribbon registration missing.");
  console.log(`Lifecycle smoke passed: ${registrations.views.length} views, ${registrations.commands.length} commands, settings and ribbon registered.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
