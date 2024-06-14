import OBR, { Image, isImage } from "@owlbear-rodeo/sdk"

/**
 * This file represents the background script run when the plugin loads.
 * It creates the tool and associated modes and actions.
 *
 * The tool hides text by copying it into the item's metadata and then
 * overwriting it with the empty string, and restores text by reversing
 * this process.
 *
 * For simplicity the tool only operates on plain text, not rich text.
 * As far as I'm aware (in June 2024) label text is always plain text,
 * so this shouldn't be an issue.
 */

// Get the reverse domain name id for this plugin at a given path
function getPluginId(path: string) {
  return `com.toadkingdom.tidytext/${path}`
}

interface ItemMetadata {
  tidytext?: string
}
function getHiddenText(item: Image) {
  const metadata = item.metadata[getPluginId("metadata")] as ItemMetadata | undefined
  return metadata?.tidytext
}

// Save and hide existing text
function stowImageText(items: Image[]) {
  for (let item of items) {
    let textToSave = item.text.plainText
    if (textToSave && item.text.type === "PLAIN") {
      // If there's already hidden text, concatenate them so no data is lost
      const hiddenText = getHiddenText(item)
      if (hiddenText && hiddenText !== textToSave) {
        textToSave = [hiddenText, textToSave].join('\n')
      }
      item.metadata[getPluginId("metadata")] = { tidytext: textToSave }
      item.text.plainText = ""
    }
  }
}

// Show previously hidden text
function restoreImageText(items: Image[]) {
  for (let item of items) {
    let textToShow = getHiddenText(item)
    if (textToShow && item.text.type === "PLAIN") {
      // If there's already label text, concatenate them so no data is lost
      const labelText = item.text.plainText
      if (labelText && labelText !== textToShow) {
        textToShow = [labelText, textToShow].join('\n')
      }
      item.metadata[getPluginId("metadata")] = { tidytext: undefined }
      item.text.plainText = textToShow
    }
  }
}

function createTool() {
  OBR.tool.create({
    id: getPluginId("tool"),
    icons: [
      {
        icon: "/img/note.svg",
        label: "Toggle Image Labels",
      },
    ],
    shortcut: "L",
  })
}

function createMode() {
  OBR.tool.createMode({
    id: getPluginId("mode"),
    icons: [
      {
        icon: "/img/note.svg",
        label: "Toggle Image Label",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    cursors: [
      {
        cursor: "pointer",
        filter: {
          target: [
            { key: "visible", value: true },
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "MAP", operator: "!=" },
          ]
        }
      }
    ],
    async onToolClick(_context, event) {
      const { target } = event
      if (target && isImage(target)) {
        // Toggle image text
        if (target.text.plainText) {
          OBR.scene.items.updateItems([target], stowImageText)
        } else {
          OBR.scene.items.updateItems([target], restoreImageText)
        }
      }
    }
  })
}

function createActionHideAll() {
  OBR.tool.createAction({
    id: getPluginId("action-hide-all"),
    icons: [
      {
        icon: "/img/hide.svg",
        label: "Hide All",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    shortcut: "H",
    async onClick(_context, _elementId) {
      OBR.scene.items.updateItems(isImage, stowImageText)
    }
  })
}

function createActionShowAll() {
  OBR.tool.createAction({
    id: getPluginId("action-show-all"),
    icons: [
      {
        icon: "/img/show.svg",
        label: "Show All",
        filter: {
          activeTools: [getPluginId("tool")],
        },
      },
    ],
    shortcut: "A",
    async onClick(_context, _elementId) {
      OBR.scene.items.updateItems(isImage, restoreImageText)
    }
  })
}

OBR.onReady(() => {
  createTool()
  createMode()
  createActionShowAll()
  createActionHideAll()
})
